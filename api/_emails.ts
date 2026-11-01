import type { Kind } from "./_schedule.js";

const BLEU = "#0A71B8";
const JAUNE = "#F39200";
const TEXTE = "#1f2d3a";

// Numéro WhatsApp du projet (photos des roses), repris des campagnes précédentes.
const WHATSAPP = { international: "2250777824447", affiche: "07\u00A077\u00A082\u00A044\u00A047" };

export type EmailContext = {
  name: string;
  quantity: number;
  days: number; // jours restants avant l'événement (négatif après)
  year: number; // année de l'édition
  eventLabel: string; // ex. « mardi 8 décembre 2026 »
  totalRoses?: number; // roses promises ou offertes à ce jour
  participants?: number;
  goal?: number;
  siteUrl: string;
  logoUrl: string;
  unsubscribeUrl: string;
};

type Block =
  | { t: "h1"; text: string }
  | { t: "p"; text: string }
  | { t: "hero"; big: string; label: string }
  | { t: "tips"; title?: string; items: [string, string][] }
  | { t: "stats"; items: [string, string][] }
  | { t: "button"; label: string; url: string; style?: "jaune" | "bleu" };

type Content = { subject: string; preheader: string; blocks: Block[] };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c
  );
}

const roses = (n: number) => `${n} rose${n > 1 ? "s" : ""}`;
const nombre = (n: number) => n.toLocaleString("fr-FR");

const partager = (c: EmailContext): Block => ({
  t: "button",
  label: "Inviter un proche",
  style: "bleu",
  url: `https://wa.me/?text=${encodeURIComponent(
    `Rejoignez-moi : offrons des roses à Marie le ${c.eventLabel}, pour sa joie 🌹 ${c.siteUrl}`
  )}`,
});

const photo = (): Block[] => [
  {
    t: "p",
    text: `Si vous le souhaitez, partagez une photo de votre rose pour la présenter sur notre site : envoyez-la par WhatsApp au **${WHATSAPP.affiche}**.`,
  },
  { t: "button", label: "Envoyer sur WhatsApp", style: "bleu", url: `https://wa.me/${WHATSAPP.international}` },
];

function content(kind: Kind, c: EmailContext): Content {
  const salut: Block = { t: "h1", text: `Ave Maria, **${c.name}** !` };
  const bouquet =
    c.totalRoses && c.totalRoses > 0 && c.participants
      ? `Nous sommes déjà **${nombre(c.totalRoses)} roses** promises par ${c.participants} participants.`
      : "";

  switch (kind) {
    case "confirmation":
      return {
        subject: `Merci pour votre promesse ${c.name} 🌹`,
        preheader: `Vos ${roses(c.quantity)} sont bien enregistrées.`,
        blocks: [
          salut,
          { t: "p", text: "Merci de rejoindre cette action : votre promesse est bien enregistrée." },
          { t: "hero", big: String(c.quantity), label: `${c.quantity > 1 ? "roses promises" : "rose promise"} à Marie` },
          {
            t: "p",
            text: `Le **${c.eventLabel}**, jour de l'Immaculée Conception, votre geste rejoindra celui de nos frères et sœurs du monde entier pour former un grand bouquet d'amour qui réjouira le Cœur uni de Jésus et Marie.`,
          },
          {
            t: "tips",
            title: "Bon à savoir",
            items: [
              ["🌹", "Vous achetez vous-même vos roses : aucun argent n'est à nous transmettre."],
              ["⛪", "Vous les déposez dans votre paroisse ou l'église la plus proche. Un proche peut le faire à votre place."],
              ["🙏", "Pas de rassemblement : nous sommes unis dans la prière, avec la même intention."],
              ["✏️", "Pour changer le nombre de roses, remplissez à nouveau le formulaire : votre dernière promesse remplace la précédente."],
            ],
          },
          partager(c),
        ],
      };

    case "relance_j14":
    case "relance_j7":
      return {
        subject: `Plus que ${c.days} jours avant le dépôt des roses 🌹`,
        preheader: `Pensez à réserver vos ${roses(c.quantity)}.`,
        blocks: [
          salut,
          { t: "hero", big: `J-${c.days}`, label: `avant le ${c.eventLabel}` },
          { t: "p", text: `Vous avez promis **${roses(c.quantity)}** à Marie : merci ! ${bouquet}`.trim() },
          {
            t: "tips",
            title: "Pour bien vous préparer",
            items: [
              ["🌹", "Réservez vos roses à l'avance chez votre fleuriste : le jour même, elles peuvent se faire rares."],
              ["⛪", "Repérez votre paroisse et l'horaire de la messe."],
              ["🤝", "Si vous êtes empêché, un proche peut déposer vos roses à votre place."],
            ],
          },
          partager(c),
        ],
      };

    case "relance_j1":
      return {
        subject: "Demain, on dépose nos roses 🌹",
        preheader: `C'est demain : n'oubliez pas vos ${roses(c.quantity)}.`,
        blocks: [
          salut,
          { t: "hero", big: "Demain", label: c.eventLabel },
          { t: "p", text: `C'est la fête de l'**Immaculée Conception**. N'oubliez pas vos **${roses(c.quantity)}** à déposer dans votre paroisse. ${bouquet}`.trim() },
          {
            t: "tips",
            items: [
              ["🌹", "Vos roses sont prêtes ? Choisissez-les fraîches, de la couleur de votre cœur."],
              ["✨", "Ne manquez pas la messe : au-delà des roses, c'est le plus précieux des gestes que vous puissiez offrir à Marie."],
              ["😉", "Vous n'en trouvez pas le jour même ? Vous pourrez les offrir tout au long de la semaine : l'important est de tenir votre promesse."],
            ],
          },
        ],
      };

    case "jour_j":
      return {
        subject: "C'est aujourd'hui : déposons nos roses 🌹",
        preheader: "Nous y sommes !",
        blocks: [
          { t: "h1", text: `Jour J, **${c.name}**` },
          { t: "hero", big: roses(c.quantity), label: "à offrir à Marie aujourd'hui" },
          {
            t: "p",
            text: "Nous y sommes ! Aujourd'hui, nous célébrons ensemble la belle fête de l'**Immaculée Conception**. Que cette journée vous comble de paix, de lumière et de la douce présence de notre Mère.",
          },
          {
            t: "p",
            text: "Votre geste rejoint celui de nos frères et sœurs pour former un grand bouquet d'amour destiné à réjouir le Cœur uni de Jésus et Marie.",
          },
          {
            t: "tips",
            items: [
              ["😉", "Vous avez du mal à trouver vos roses aujourd'hui ? Pas d'inquiétude : vous pouvez les offrir tout au long de la semaine."],
              ["⛪", "Et surtout, ne manquez pas la messe de ce jour : c'est le plus beau des gestes."],
            ],
          },
          ...photo(),
        ],
      };

    case "merci": {
      const atteint = c.goal && c.totalRoses ? c.totalRoses >= c.goal : false;
      return {
        subject: "Merci pour ce beau geste 🌹",
        preheader: c.totalRoses ? `${nombre(c.totalRoses)} roses offertes à Marie, grâce à vous.` : "Merci de tout cœur.",
        blocks: [
          { t: "h1", text: `Merci, **${c.name}**` },
          ...(c.totalRoses && c.participants
            ? ([
                { t: "hero", big: nombre(c.totalRoses), label: `roses offertes par ${c.participants} participants` },
              ] as Block[])
            : []),
          {
            t: "p",
            text: `Merci du fond du cœur pour votre participation à l'édition ${c.year} de « 1000 roses Pour la Joie de Marie ». Grâce à vous, cette aventure a été une véritable source de **joie, de communion et d'espérance**.`,
          },
          {
            t: "p",
            text: atteint
              ? `Le challenge des **${nombre(c.goal!)} roses** est atteint ! Au-delà des chiffres, ce sont vos cœurs, vos prières et votre engagement qui ont formé le plus beau des bouquets pour Marie.`
              : `Le challenge des **${nombre(c.goal ?? 1000)} roses** n'a pas été atteint, mais ce n'est pas un échec : c'est avant tout une très belle expérience humaine et spirituelle, vécue ensemble. Ce sont vos cœurs, vos prières et votre engagement qui ont formé le plus beau des bouquets pour Marie.`,
          },
          { t: "p", text: `L'aventure continue… **Rendez-vous en ${c.year + 1}**, avec encore plus de foi, d'unité et, pourquoi pas, encore plus de roses 🌹😉` },
          ...photo(),
          { t: "button", label: "Voir la galerie", style: "jaune", url: `${c.siteUrl}/#galerie` },
        ],
      };
    }

    case "invitation":
      return {
        subject: "Et si on offrait à nouveau 1000 roses à Marie ? 🌹",
        preheader: `Rendez-vous le ${c.eventLabel} pour l'Immaculée Conception.`,
        blocks: [
          salut,
          {
            t: "p",
            text: `Le **${c.eventLabel}**, nous fêterons l'Immaculée Conception, et nous voulons former un grand bouquet, fait de nos prières et de nos efforts, avec pour seul objectif de réjouir le Cœur uni de Jésus et Marie.`,
          },
          { t: "p", text: "Chaque rose constituera une oraison silencieuse, une action de grâce à Celle qui nous conduit au Verbe." },
          { t: "stats", items: [["1 187", "roses en 2024"], ["752", "roses en 2025"]] },
          { t: "p", text: "Joignez votre rose aux nôtres : l'inscription prend une minute." },
          { t: "button", label: "Joindre ma rose aux nôtres", style: "jaune", url: c.siteUrl },
        ],
      };
  }
}

// Typographie française : espace insécable avant « ! ? : ; » et dans les guillemets.
const typo = (text: string) => text.replace(/ ([!?:;»])/g, "\u00A0$1").replace(/« /g, "«\u00A0");

const inline = (text: string, accent = JAUNE) =>
  escapeHtml(typo(text)).replace(/\*\*(.+?)\*\*/g, `<strong style="color:${accent};font-weight:700">$1</strong>`);

function renderBlock(b: Block): string {
  switch (b.t) {
    case "h1":
      return `<h1 style="margin:8px 0 18px;font-size:26px;line-height:1.25;font-weight:700;color:${BLEU};text-align:center">${inline(b.text)}</h1>`;
    case "p":
      return `<p style="margin:0 0 18px;font-size:17px;line-height:1.6;color:${TEXTE}">${inline(b.text)}</p>`;
    case "hero":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr><td align="center" style="background:${JAUNE};border-radius:16px;padding:22px 16px"><div style="font-size:52px;line-height:1.05;font-weight:900;color:#ffffff">${escapeHtml(b.big)}</div><div style="margin-top:8px;font-size:17px;font-weight:700;color:#ffffff">${escapeHtml(b.label)}</div></td></tr></table>`;
    case "stats":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr>${b.items
        .map(
          ([big, label], i) =>
            `<td width="50%" align="center" style="background:${BLEU};border-radius:14px;padding:18px 8px"><div style="font-size:34px;line-height:1.1;font-weight:900;color:${JAUNE}">${escapeHtml(big)}</div><div style="margin-top:4px;font-size:14px;font-weight:700;color:#ffffff">${escapeHtml(label)}</div></td>${i < b.items.length - 1 ? '<td width="12">&nbsp;</td>' : ""}`
        )
        .join("")}</tr></table>`;
    case "tips":
      return `${b.title ? `<p style="margin:6px 0 10px;font-size:18px;font-weight:700;color:${BLEU}">${escapeHtml(b.title)}</p>` : ""}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${b.items
        .map(
          ([emoji, text]) =>
            `<tr><td width="38" valign="top" style="padding:6px 0;font-size:22px;line-height:1.4">${emoji}</td><td valign="top" style="padding:6px 0;font-size:16px;line-height:1.55;color:${TEXTE}">${inline(text)}</td></tr>`
        )
        .join("")}</table>`;
    case "button": {
      const bg = b.style === "bleu" ? BLEU : JAUNE;
      return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:6px auto 18px"><tr><td align="center" style="background:${bg};border-radius:10px"><a href="${escapeHtml(b.url)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">${escapeHtml(b.label)}</a></td></tr></table>`;
    }
  }
}

const plain = (text: string) => text.replace(/\*\*/g, "");

function renderText(blocks: Block[]) {
  return blocks
    .map((b) => {
      switch (b.t) {
        case "h1":
        case "p":
          return plain(b.text);
        case "hero":
          return `${b.big} ${b.label}`;
        case "stats":
          return b.items.map(([big, label]) => `${big} ${label}`).join(" | ");
        case "tips":
          return [b.title, ...b.items.map(([e, t]) => `${e} ${plain(t)}`)].filter(Boolean).join("\n");
        case "button":
          return `${b.label} : ${b.url}`;
      }
    })
    .join("\n\n");
}

export function render(kind: Kind, c: EmailContext) {
  const { subject, preheader, blocks } = content(kind, c);

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${BLEU};font-family:Roboto,Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BLEU}">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLEU}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">
<tr><td align="center" style="padding:28px 24px 8px"><img src="${escapeHtml(c.logoUrl)}" width="240" alt="Pour la Joie de Marie" style="display:block;width:240px;max-width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:12px 32px 12px">${blocks.map(renderBlock).join("")}</td></tr>
<tr><td align="center" style="background:${JAUNE};padding:22px 24px"><div style="font-size:17px;font-weight:700;color:#ffffff">Pour la Joie de Marie</div><div style="margin-top:6px;font-size:14px;color:#ffffff">« Portée par la Petite Thérèse et Carlo Acutis 🌹 »</div></td></tr>
</table>
<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#d6e7f5;text-align:center">contact@pourlajoiedemarie.com<br><a href="${escapeHtml(c.unsubscribeUrl)}" style="color:#ffffff;text-decoration:underline">Ne plus recevoir ces emails</a></p>
</td></tr></table></body></html>`;

  const text = [
    renderText(blocks),
    "Pour la Joie de Marie\n« Portée par la Petite Thérèse et Carlo Acutis »",
    `Ne plus recevoir ces emails : ${c.unsubscribeUrl}`,
  ].join("\n\n");

  return { subject, html, text };
}
