// Vérifications de la logique d'envoi : npm run check:mail
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { daysLeft, kindForDays, RULES, isCampaignKind } from "./_schedule.js";
import { render } from "./_emails.js";
import { verifyWebhook } from "./_resend.js";

// Calendrier : une fenêtre par type d'email, sans trou entre J-14 et J+7.
const expected: Record<number, string | null> = {
  15: null, 14: "relance_j14", 8: "relance_j14", 7: "relance_j7", 2: "relance_j7",
  1: "relance_j1", 0: "jour_j", [-1]: "merci", [-7]: "merci", [-8]: null,
};
for (const [days, kind] of Object.entries(expected)) assert.equal(kindForDays(Number(days)), kind, `J${days}`);
for (let d = -7; d <= 14; d++) assert.ok(kindForDays(d), `fenêtre manquante à ${d}`);
assert.ok(Object.keys(RULES).every(isCampaignKind));
assert.equal(daysLeft("2026-12-08", new Date("2026-10-31T22:00:00Z")), 38);

// Modèles : échappement HTML, lien de désabonnement, pluriel.
const ctx = {
  name: '<b>Marie</b>', quantity: 1, days: 7, eventLabel: "mardi 8 décembre 2026",
  totalRoses: 120, siteUrl: "https://exemple.org", unsubscribeUrl: "https://exemple.org/api/unsubscribe?t=abc",
};
const mail = render("relance_j7", ctx);
assert.ok(!mail.html.includes("<b>Marie</b>"), "nom non échappé");
assert.ok(mail.html.includes("&lt;b&gt;Marie"), "nom échappé attendu");
assert.ok(mail.html.includes(ctx.unsubscribeUrl) && mail.text.includes(ctx.unsubscribeUrl));
assert.ok(mail.text.includes("1 rose ") || mail.text.includes("1 rose dans"), "pluriel");
assert.ok(mail.subject.includes("7 jours"));
for (const kind of ["confirmation", "relance_j14", "relance_j1", "jour_j", "merci"] as const) {
  const m = render(kind, { ...ctx, quantity: 3 });
  assert.ok(m.subject && m.html.includes("Ne plus recevoir") && m.text.includes("3 roses"), kind);
}
const invitation = render("invitation", ctx);
assert.ok(invitation.subject.includes("2026") && invitation.html.includes("Je participe") && !invitation.text.includes("undefined"), "invitation");
assert.ok(!isCampaignKind("invitation") && !isCampaignKind("confirmation"), "invitation et confirmation ne sont jamais planifiées");

// Webhook Svix : signature valide acceptée, corps altéré ou vieux timestamp refusés.
const secret = "whsec_" + Buffer.from("secret-de-test").toString("base64");
const body = '{"type":"email.bounced"}';
const ts = String(Math.floor(Date.now() / 1000));
const sig = createHmac("sha256", Buffer.from("secret-de-test")).update(`msg_1.${ts}.${body}`).digest("base64");
const headers = new Headers({ "svix-id": "msg_1", "svix-timestamp": ts, "svix-signature": `v1,${sig}` });
assert.equal(verifyWebhook(secret, headers, body), true);
assert.equal(verifyWebhook(secret, headers, body + " "), false);
assert.equal(verifyWebhook(secret, headers, body, Date.now() + 3600_000), false);

console.log("check:mail OK");
