// Envoie un exemplaire de chaque email à UNE adresse de test : npm run mail:test -- vous@exemple.com
// Les chiffres (nom, roses, total) sont fictifs ; les objets sont préfixés « [TEST n/7] ».
import { render } from "./_emails.js";
import { mailConfig, sendBatch } from "./_resend.js";
import type { Kind } from "./_schedule.js";

const to = process.argv[2];
if (process.argv.length !== 3 || !to?.includes("@")) {
  console.error("Usage : npm run mail:test -- adresse@exemple.com (une seule adresse)");
  process.exit(1);
}
const config = mailConfig();
if (!config) {
  console.error("RESEND_API_KEY et RESEND_FROM_EMAIL manquent (.env.local)");
  process.exit(1);
}

const eventLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
}).format(new Date("2026-12-08T00:00:00Z"));
const unsubscribeUrl = `${config.apiUrl}/api/unsubscribe?t=00000000-0000-0000-0000-000000000000`;

// [type, jours restants simulés]
// [type, jours restants simulés, roses totales simulées, variante]
const plan: [Kind, number, number, string][] = [
  ["confirmation", 37, 0, ""], ["invitation", 37, 0, ""], ["relance_j14", 12, 340, ""], ["relance_j7", 5, 340, ""],
  ["relance_j1", 1, 340, ""], ["jour_j", 0, 0, ""],
  ["merci", -1, 1043, " (objectif dépassé)"], ["merci", -1, 752, " (objectif non atteint)"],
];

// ONLY=invitation,merci npm run mail:test -- adresse : n'envoie que ces types.
const only = process.env.ONLY?.split(",");
const messages = plan.map(([kind, days, total, variante], i) => {
  const { subject, html, text } = render(kind, {
    name: "Jaurès", quantity: 12, days, eventLabel, year: 2026, goal: 1000,
    totalRoses: total || undefined, participants: total ? Math.round(total / 8) : undefined,
    siteUrl: config.siteUrl, logoUrl: config.logoUrl, unsubscribeUrl,
  });
  if (only && !only.includes(kind)) return null;
  return {
    to, subject: `[TEST ${i + 1}/${plan.length}${variante}] ${subject}`, html, text,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
});

const selected = messages.filter((m) => m !== null);
const result = await sendBatch(config, selected);
result.ids.forEach((id, i) => console.log(id ? "envoyé " : "ÉCHEC  ", selected[i].subject.slice(0, 60)));
if (result.error) console.error(result.error);
