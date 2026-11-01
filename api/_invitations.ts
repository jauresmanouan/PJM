// Invitation aux anciens participants (vœux de Toussaint).
//   npm run invitations                        aperçu : décompte et exclusions, rien n'est écrit ni envoyé
//   npm run invitations -- --confirm           importe la liste dans la base puis envoie
//   npm run invitations -- --confirm --limite=10   n'envoie qu'aux 10 premières personnes (essai)
// Entrée : PJM-2025/audience-invitation.csv (données personnelles, dossier ignoré par git).
// Exclusions : adresses invalides, personnes déjà inscrites à l'édition en cours, désabonnés
// (liste Brevo facultative : PJM-2025/desabonnes-brevo.csv, une adresse par ligne), désabonnés d'une invitation précédente.
import { existsSync, readFileSync } from "node:fs";
import { currentEdition } from "./_deliver.js";
import { render } from "./_emails.js";
import { mailConfig, sendBatch } from "./_resend.js";
import { daysLeft } from "./_schedule.js";
import { configured, supabaseRequest } from "./_supabase.js";

const CSV = "PJM-2025/audience-invitation.csv";
const BREVO = "PJM-2025/desabonnes-brevo.csv";
const confirmer = process.argv.includes("--confirm");
const limite = Number(process.argv.find((a) => a.startsWith("--limite="))?.split("=")[1]) || Infinity;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Lecture CSV minimale (guillemets, virgules dans les champs).
function lireCsv(texte: string) {
  const lignes: string[][] = [];
  let champ = "", ligne: string[] = [], citation = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (citation) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') citation = false;
      else champ += c;
    } else if (c === '"') citation = true;
    else if (c === ",") { ligne.push(champ); champ = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ); champ = "";
      if (ligne.some(Boolean)) lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  const [entete, ...donnees] = lignes;
  return donnees.map((l) => Object.fromEntries(entete.map((h, i) => [h, l[i] ?? ""])));
}

if (!configured()) throw new Error("Supabase non configuré (.env.local)");
const edition = await currentEdition();
const config = mailConfig();
if (!edition || !config) throw new Error("Édition ou Resend non configuré");

const personnes = lireCsv(readFileSync(CSV, "utf8")).map((r) => ({
  email: r.email.trim().toLowerCase(),
  prenom: r.prenom.trim(),
  annees: r.annees.split("+").map(Number).filter(Boolean),
}));

const brevo = existsSync(BREVO)
  ? new Set(readFileSync(BREVO, "utf8").split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))
  : null;
const inscrits = new Set<string>(
  ((await (await supabaseRequest(`participations?edition_year=eq.${edition.year}&select=email`)).json()) as { email: string }[]).map((r) => r.email)
);
const desabonnes = new Set<string>(
  ((await (await supabaseRequest("invitations?unsubscribed_at=not.is.null&select=email")).json()) as { email: string }[]).map((r) => r.email)
);

const exclus = { invalide: 0, dejaInscrit: 0, brevo: 0, desabonne: 0 };
const retenues = personnes.filter((p) => {
  if (!EMAIL.test(p.email) || !p.prenom) { exclus.invalide++; return false; }
  if (inscrits.has(p.email)) { exclus.dejaInscrit++; return false; }
  if (brevo?.has(p.email)) { exclus.brevo++; return false; }
  if (desabonnes.has(p.email)) { exclus.desabonne++; return false; }
  return true;
});

console.log(`Liste : ${personnes.length} adresses | à écrire : ${retenues.length} | exclues :`, exclus);
console.log(brevo ? `Désabonnés Brevo exclus : liste de ${brevo.size} adresses chargée.` : `ATTENTION : ${BREVO} absent, les désabonnés Brevo ne sont pas exclus.`);
if (!confirmer) {
  console.log("Aperçu seulement : rien n'a été écrit ni envoyé. Ajoutez --confirm pour envoyer.");
  process.exit(0);
}

// 1. Import (les lignes existantes gardent leur jeton et leur état)
const aEnvoyer = retenues.slice(0, limite);
const import_ = await supabaseRequest("invitations?on_conflict=email", {
  method: "POST",
  headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
  body: JSON.stringify(aEnvoyer.map((p) => ({ email: p.email, prenom: p.prenom, annees: p.annees }))),
});
if (!import_.ok) throw new Error(`Import impossible : ${await import_.text()}`);

// 2. Destinataires encore à contacter (pas déjà envoyé, pas désabonné)
const liste = aEnvoyer.map((p) => encodeURIComponent(p.email)).join(",");
const lignes = (await (
  await supabaseRequest(`invitations?email=in.(${liste})&unsubscribed_at=is.null&status=in.(pending,failed)&select=email,prenom,annees,unsubscribe_token`)
).json()) as { email: string; prenom: string; annees: number[]; unsubscribe_token: string }[];
console.log(`Envoi à ${lignes.length} personne(s)…`);

const eventLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  .format(new Date(`${edition.event_date}T00:00:00Z`));
let envoyes = 0, echecs = 0;
for (let i = 0; i < lignes.length; i += 50) {
  const lot = lignes.slice(i, i + 50);
  const messages = lot.map((l) => {
    const lien = `${config.apiUrl}/api/unsubscribe?t=${l.unsubscribe_token}`;
    const { subject, html, text } = render("invitation", {
      name: l.prenom, quantity: 0, days: daysLeft(edition.event_date), year: edition.year, eventLabel,
      siteUrl: config.siteUrl, logoUrl: config.logoUrl, unsubscribeUrl: lien, occasion: "toussaint", annees: l.annees,
    });
    return { to: l.email, subject, html, text, headers: { "List-Unsubscribe": `<${lien}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } };
  });
  const resultat = await sendBatch(config, messages, `invitation-toussaint-${edition.year}-${l(lot)}`);
  const maintenant = new Date().toISOString();
  await supabaseRequest("invitations?on_conflict=email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(
      lot.map((p, k) => {
        const id = resultat.ids[k];
        id ? envoyes++ : echecs++;
        return { email: p.email, prenom: p.prenom, annees: p.annees, status: id ? "sent" : "failed", resend_id: id, error: id ? null : resultat.error ?? "échec", sent_at: id ? maintenant : null };
      })
    ),
  });
}
console.log(`Terminé : ${envoyes} envoyés, ${echecs} en échec.`);

// Clé d'idempotence stable d'un lot : les mêmes destinataires ne reçoivent jamais deux fois le même envoi.
function l(lot: { email: string }[]) {
  return lot.map((p) => p.email).join("|").length + "-" + lot[0].email;
}
