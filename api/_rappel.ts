// Rappel aux anciens participants invités qui ne se sont pas inscrits à l'édition en cours.
//   npm run rappel -- --a=2026-11-09T08:30:00Z            aperçu : décompte et exclusions, rien n'est envoyé
//   npm run rappel -- --a=2026-11-09T08:30:00Z --confirm  programme l'envoi chez Resend à cette heure (UTC)
//   ajouter --limite=3 pour un essai sur les 3 premières adresses
// Resend n'accepte pas l'heure programmée dans les envois groupés : un appel par destinataire (~120, quelques secondes).
// Le fichier PJM-2025/rappel-programme.json (dossier ignoré par git) empêche de reprogrammer deux fois la même adresse.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { currentEdition } from "./_deliver.js";
import { render } from "./_emails.js";
import { mailConfig } from "./_resend.js";
import { daysLeft } from "./_schedule.js";
import { configured, supabaseRequest } from "./_supabase.js";

const FAIT = "PJM-2025/rappel-programme.json";
const confirmer = process.argv.includes("--confirm");
const limite = Number(process.argv.find((a) => a.startsWith("--limite="))?.split("=")[1]) || Infinity;
const heure = new Date(process.argv.find((a) => a.startsWith("--a="))?.split("=")[1] ?? "");
if (Number.isNaN(heure.getTime()) || heure.getTime() < Date.now() + 120_000) throw new Error("Indiquez une heure future : --a=2026-11-09T08:30:00Z");

if (!configured()) throw new Error("Supabase non configuré (.env.local)");
const edition = await currentEdition();
const config = mailConfig();
if (!edition || !config) throw new Error("Édition ou Resend non configuré");

const lire = async <T>(chemin: string) => (await (await supabaseRequest(chemin)).json()) as T[];
const inscrits = new Set((await lire<{ email: string }>(`participations?edition_year=eq.${edition.year}&select=email`)).map((r) => r.email.toLowerCase()));
const invites = await lire<{ email: string; prenom: string; annees: number[]; unsubscribe_token: string }>(
  "invitations?status=eq.sent&unsubscribed_at=is.null&select=email,prenom,annees,unsubscribe_token&order=email"
);
const dejaProgramme = new Set<string>(existsSync(FAIT) ? JSON.parse(readFileSync(FAIT, "utf8")) : []);

const retenus = invites.filter((p) => !inscrits.has(p.email.toLowerCase()) && !dejaProgramme.has(p.email)).slice(0, limite);
console.log(`Invités : ${invites.length} | déjà inscrits : ${invites.filter((p) => inscrits.has(p.email.toLowerCase())).length} | déjà programmés : ${dejaProgramme.size} | à programmer : ${retenus.length}`);
console.log(`Envoi prévu le ${heure.toISOString()} (UTC), « il reste ${daysLeft(edition.event_date, heure)} jours ».`);
if (!confirmer) {
  console.log("Aperçu seulement : rien n'a été envoyé. Ajoutez --confirm pour programmer.");
  process.exit(0);
}

const eventLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  .format(new Date(`${edition.event_date}T00:00:00Z`));
let ok = 0, echecs = 0;
for (const p of retenus) {
  const lien = `${config.apiUrl}/api/unsubscribe?t=${p.unsubscribe_token}`;
  const { subject, html, text } = render("invitation", {
    name: p.prenom, quantity: 0, days: daysLeft(edition.event_date, heure), year: edition.year, eventLabel,
    siteUrl: config.siteUrl, logoUrl: config.logoUrl, unsubscribeUrl: lien, occasion: "rappel", annees: p.annees,
  });
  const reponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", "Idempotency-Key": `rappel-${edition.year}-${p.email}` },
    body: JSON.stringify({
      from: config.from, to: [p.email], reply_to: config.replyTo, subject, html, text,
      scheduled_at: heure.toISOString(),
      headers: { "List-Unsubscribe": `<${lien}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  if (reponse.ok) { ok++; dejaProgramme.add(p.email); writeFileSync(FAIT, JSON.stringify([...dejaProgramme])); }
  else { echecs++; console.log(`Échec ${p.email} : ${reponse.status} ${await reponse.text()}`); }
  await new Promise((r) => setTimeout(r, 600)); // Resend : 2 requêtes par seconde
}
console.log(`Terminé : ${ok} programmés, ${echecs} en échec.`);
