import type { Kind } from "./_schedule";

const BLEU = "#0A71B8";
const JAUNE = "#F39200";

export type EmailContext = {
  name: string;
  quantity: number;
  days: number; // jours restants avant l'événement (négatif après)
  eventLabel: string; // ex. « mardi 8 décembre 2026 »
  totalRoses?: number;
  siteUrl: string;
  unsubscribeUrl: string;
};

type Content = { subject: string; paragraphs: string[]; cta?: { label: string; url: string } };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c
  );
}

const roses = (n: number) => `${n} rose${n > 1 ? "s" : ""}`;

function content(kind: Kind, c: EmailContext): Content {
  const hello = `Bonjour ${c.name},`;
  const bouquet =
    c.totalRoses && c.totalRoses > 0
      ? `Nous sommes déjà ${c.totalRoses} roses promises pour former ce bouquet.`
      : "";

  switch (kind) {
    case "confirmation":
      return {
        subject: `Merci ${c.name}, votre participation est enregistrée`,
        paragraphs: [
          `Merci ${c.name} de participer à cette action communautaire.`,
          `Vos ${roses(c.quantity)} se joignent à celles de nombreux autres participants, formant un bouquet de bonheur qui saura réjouir le Cœur de Notre Chère Mère.`,
          `Rendez-vous le ${c.eventLabel}, jour de l'Immaculée Conception : vous achetez vous-même vos roses, puis vous les déposez dans votre paroisse. Aucun argent n'est à nous transmettre.`,
          `Pour modifier le nombre de roses, remplissez à nouveau le formulaire : votre dernière participation remplace la précédente.`,
        ],
        cta: { label: "Voir le site", url: c.siteUrl },
      };
    case "relance_j14":
    case "relance_j7":
      return {
        subject: `Plus que ${c.days} jours avant le dépôt des roses 🌹`,
        paragraphs: [
          hello,
          `Le ${c.eventLabel}, vous déposerez ${roses(c.quantity)} dans votre paroisse, en union avec tous les participants.`,
          bouquet,
          `Pensez dès maintenant à réserver vos roses chez votre fleuriste.`,
        ].filter(Boolean),
        cta: { label: "Voir le compte à rebours", url: c.siteUrl },
      };
    case "relance_j1":
      return {
        subject: "Demain, on dépose nos roses 🌹",
        paragraphs: [
          hello,
          `C'est demain, ${c.eventLabel} : le jour de l'Immaculée Conception.`,
          `N'oubliez pas vos ${roses(c.quantity)} à déposer dans votre paroisse.`,
          bouquet,
        ].filter(Boolean),
      };
    case "jour_j":
      return {
        subject: "C'est aujourd'hui : déposons nos roses 🌹",
        paragraphs: [
          hello,
          `Aujourd'hui, ${c.eventLabel}, vous déposez vos ${roses(c.quantity)} dans votre paroisse.`,
          `Nous sommes unis spirituellement dans ce geste offert pour la joie de Marie.`,
        ],
      };
    case "merci":
      return {
        subject: "Merci pour ce bouquet 🌹",
        paragraphs: [
          hello,
          `Vos ${roses(c.quantity)} ont rejoint le bouquet offert à Marie. Merci de tout cœur pour votre participation.`,
          `Si vous le souhaitez, répondez à ce message avec une photo de vos roses : elle pourra rejoindre la galerie du site.`,
        ],
        cta: { label: "Voir la galerie", url: `${c.siteUrl}/#galerie` },
      };
  }
}

export function render(kind: Kind, c: EmailContext) {
  const { subject, paragraphs, cta } = content(kind, c);
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#17374d">${escapeHtml(p)}</p>`)
    .join("");
  const button = cta
    ? `<p style="margin:24px 0 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${JAUNE};color:#ffffff;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px">${escapeHtml(cta.label)}</a></p>`
    : "";

  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff">
<div style="background:${BLEU};padding:24px;text-align:center"><span style="color:#ffffff;font-size:22px;font-weight:bold">Pour la Joie de Marie</span></div>
<div style="padding:32px 28px">${body}${button}
<p style="margin:32px 0 0;font-size:13px;font-style:italic;color:#6b7a86">Portée par la Petite Thérèse et Carlo Acutis 🌹</p></div>
<div style="padding:16px 28px 28px;text-align:center;font-size:12px;color:#6b7a86">
contact@pourlajoiedemarie.com<br>
<a href="${escapeHtml(c.unsubscribeUrl)}" style="color:#6b7a86">Ne plus recevoir ces emails</a></div>
</div></body></html>`;

  const text = [
    ...paragraphs,
    cta ? `${cta.label} : ${cta.url}` : "",
    "Portée par la Petite Thérèse et Carlo Acutis",
    `Ne plus recevoir ces emails : ${c.unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject, html, text };
}
