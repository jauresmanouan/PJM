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
const plan: [Kind, number][] = [
  ["confirmation", 37], ["invitation", 37], ["relance_j14", 12], ["relance_j7", 5],
  ["relance_j1", 1], ["jour_j", 0], ["merci", -1],
];

const messages = plan.map(([kind, days], i) => {
  const { subject, html, text } = render(kind, {
    name: "Jaurès", quantity: 12, days, eventLabel, totalRoses: 340,
    siteUrl: config.siteUrl, unsubscribeUrl,
  });
  return {
    to, subject: `[TEST ${i + 1}/${plan.length}] ${subject}`, html, text,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
});

const result = await sendBatch(config, messages);
result.ids.forEach((id, i) => console.log(id ? "envoyé " : "ÉCHEC  ", plan[i][0]));
if (result.error) console.error(result.error);
