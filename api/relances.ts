import { configured, supabaseRequest } from "./_supabase.js";
import { deliver, editionStats, type Edition, type Recipient } from "./_deliver.js";
import { RULES, daysLeft, isCampaignKind, kindForDays } from "./_schedule.js";

// Appelé chaque jour par le cron Vercel (voir vercel.json), qui envoie « Authorization: Bearer $CRON_SECRET ».
// Options pour tester à la main :  ?dry=1  compte les destinataires sans rien envoyer
//                                  ?kind=relance_j7  force un type d'email (règles de délai conservées)
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!configured()) return Response.json({ error: "Supabase non configuré" }, { status: 503 });

  const params = new URL(request.url).searchParams;
  const dry = params.has("dry");
  const forced = params.get("kind");
  if (forced && !isCampaignKind(forced)) return Response.json({ error: "Type inconnu" }, { status: 400 });

  // Éditions dont l'événement est à venir ou terminé depuis moins de 8 jours.
  const since = new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10);
  const editionsResponse = await supabaseRequest(`editions?event_date=gte.${since}&select=year,event_date,goal&order=year`);
  if (!editionsResponse.ok) return Response.json({ error: "Éditions illisibles" }, { status: 502 });
  const editions: Edition[] = await editionsResponse.json();

  const report = [];
  for (const edition of editions) {
    const days = daysLeft(edition.event_date);
    const kind = forced && isCampaignKind(forced) ? forced : kindForDays(days);
    if (!kind) { report.push({ year: edition.year, days, kind: null }); continue; }

    const rule = RULES[kind];
    const dueResponse = await supabaseRequest("rpc/participants_due", {
      method: "POST",
      body: JSON.stringify({ p_year: edition.year, p_kind: kind, p_min_age: rule.minAge, p_cooldown: rule.cooldown }),
    });
    if (!dueResponse.ok) { report.push({ year: edition.year, days, kind, error: "participants_due" }); continue; }
    const due: Recipient[] = await dueResponse.json();

    if (dry) { report.push({ year: edition.year, days, kind, due: due.length }); continue; }
    const result = due.length ? await deliver(edition, kind, due, await editionStats(edition.year)) : { sent: 0, failed: 0, skipped: 0 };
    report.push({ year: edition.year, days, kind, due: due.length, ...result });
  }

  return Response.json({ dry, report });
}
