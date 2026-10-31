import { configured, supabaseRequest } from "./_supabase";

const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, message: string, form = "") {
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A71B8;font-family:Arial,Helvetica,sans-serif;padding:16px">
<div style="background:#fff;border-radius:24px;padding:32px;max-width:420px;text-align:center;color:#0A71B8">
<h1 style="margin:0 0 12px;font-size:24px">${title}</h1><p style="margin:0 0 20px;line-height:1.5">${message}</p>${form}
<p style="margin:20px 0 0"><a href="/" style="color:#F39200;font-weight:bold;text-decoration:none">Retour au site</a></p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

function token(request: Request) {
  const value = new URL(request.url).searchParams.get("t") ?? "";
  return TOKEN.test(value) ? value : null;
}

// Un simple GET (aperçu d'un client mail, antivirus) ne désabonne personne : il faut confirmer.
export async function GET(request: Request) {
  if (!token(request)) return page("Lien invalide", "Ce lien de désabonnement n'est pas valide.");
  return page(
    "Se désabonner ?",
    "Vous ne recevrez plus de rappels pour Pour la Joie de Marie.",
    `<form method="post"><button style="background:#F39200;color:#fff;font-weight:bold;border:0;border-radius:8px;padding:12px 24px;font-size:16px;cursor:pointer">Me désabonner</button></form>`
  );
}

// Appelé par le bouton ci-dessus, ou en un clic par les clients mail (en-tête List-Unsubscribe-Post).
export async function POST(request: Request) {
  const t = token(request);
  if (!t) return page("Lien invalide", "Ce lien de désabonnement n'est pas valide.");
  if (!configured()) return page("Service indisponible", "Réessayez dans quelques instants.");

  const response = await supabaseRequest(`participations?unsubscribe_token=eq.${t}&unsubscribed_at=is.null`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ unsubscribed_at: new Date().toISOString(), unsubscribe_reason: "user" }),
  });
  if (!response.ok) return page("Service indisponible", "Réessayez dans quelques instants.");
  return page("Désabonnement confirmé", "Vous ne recevrez plus de rappels. Merci pour votre participation 🌹");
}
