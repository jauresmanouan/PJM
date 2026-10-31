import { configured, supabaseRequest } from "./_supabase.js";
import { verifyWebhook } from "./_resend.js";

// À déclarer dans Resend > Webhooks (événements email.bounced et email.complained) vers /api/resend-webhook.
// Un rebond définitif ou une plainte désabonne automatiquement le destinataire : protège la réputation d'envoi.
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !configured()) return Response.json({ error: "Non configuré" }, { status: 503 });

  const body = await request.text();
  if (!verifyWebhook(secret, request.headers, body)) return Response.json({ error: "Signature invalide" }, { status: 401 });

  let event: { type?: string; data?: { email_id?: string; bounce?: { type?: string } } };
  try { event = JSON.parse(body); } catch { return Response.json({ error: "Corps invalide" }, { status: 400 }); }

  const resendId = event.data?.email_id;
  const hardBounce = event.type === "email.bounced" && event.data?.bounce?.type === "Permanent";
  const complaint = event.type === "email.complained";
  if (!resendId || !(hardBounce || complaint)) return Response.json({ ignored: true });

  const logResponse = await supabaseRequest(`email_logs?resend_id=eq.${encodeURIComponent(resendId)}&select=edition_year,email`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status: complaint ? "complained" : "bounced" }),
  });
  if (!logResponse.ok) return Response.json({ error: "Journal illisible" }, { status: 502 });

  const rows: { edition_year: number; email: string }[] = await logResponse.json();
  for (const row of rows) {
    // Le désabonnement vaut pour toutes les éditions : même adresse, même problème.
    await supabaseRequest(`participations?email=eq.${encodeURIComponent(row.email)}&unsubscribed_at=is.null`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ unsubscribed_at: new Date().toISOString(), unsubscribe_reason: complaint ? "complaint" : "bounce" }),
    });
  }
  return Response.json({ updated: rows.length });
}
