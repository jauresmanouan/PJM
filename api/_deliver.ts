import { supabaseRequest } from "./_supabase.js";
import { render } from "./_emails.js";
import { daysLeft, type Kind } from "./_schedule.js";
import { mailConfig, sendBatch, type Message } from "./_resend.js";

export type Recipient = {
  email: string;
  firstname: string;
  name: string;
  quantity: number;
  unsubscribe_token: string;
};

export type Edition = { year: number; event_date: string; goal: number };

// Édition ouverte aux inscriptions (la plus récente).
export async function currentEdition(): Promise<Edition | null> {
  const response = await supabaseRequest(
    "editions?registration_open=eq.true&order=year.desc&limit=1&select=year,event_date,goal"
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] ?? null;
}

export async function totalRoses(year: number) {
  const response = await supabaseRequest("rpc/participation_stats", {
    method: "POST",
    body: JSON.stringify({ edition_year: year }),
  });
  if (!response.ok) return undefined;
  const data = await response.json();
  return Number(data.total_quantity) || 0;
}

type LogRow = {
  edition_year: number;
  email: string;
  kind: Kind;
  status: "pending" | "sent" | "failed";
  resend_id: string | null;
  error: string | null;
  sent_at: string | null;
};

async function writeLogs(rows: LogRow[]) {
  const response = await supabaseRequest("email_logs?on_conflict=edition_year%2Cemail%2Ckind", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!response.ok) console.error("email_logs", response.status, await response.text());
}

// Envoie un email à chaque destinataire et note le résultat dans email_logs.
// L'éligibilité (désabonnement, doublons, délais) est décidée en amont par SQL (participants_due).
export async function deliver(
  edition: Edition,
  kind: Kind,
  recipients: Recipient[],
  roses?: number
) {
  const config = mailConfig();
  if (!config) return { sent: 0, failed: 0, skipped: recipients.length, reason: "Resend non configuré" };

  const days = daysLeft(edition.event_date);
  const eventLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${edition.event_date}T00:00:00Z`));

  const base = { edition_year: edition.year, kind, error: null, resend_id: null, sent_at: null };
  await writeLogs(recipients.map((r) => ({ ...base, email: r.email, status: "pending" })));

  let sent = 0;
  let failed = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < recipients.length; i += 50) {
    const chunk = recipients.slice(i, i + 50);
    const messages: Message[] = chunk.map((r) => {
      const unsubscribeUrl = `${config.apiUrl}/api/unsubscribe?t=${r.unsubscribe_token}`;
      const { subject, html, text } = render(kind, {
        name: r.name, quantity: r.quantity, days, eventLabel,
        totalRoses: roses, siteUrl: config.siteUrl, unsubscribeUrl,
      });
      return {
        to: r.email, subject, html, text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    // La confirmation peut être renvoyée à chaque modification : pas de clé d'idempotence.
    const key = kind === "confirmation" ? undefined : `${edition.year}-${kind}-${today}-${i}`;
    const result = await sendBatch(config, messages, key);

    await writeLogs(
      chunk.map((r, index) => {
        const id = result.ids[index];
        id ? sent++ : failed++;
        return {
          ...base,
          email: r.email,
          status: id ? "sent" : "failed",
          resend_id: id,
          error: id ? null : result.error ?? "échec",
          sent_at: id ? new Date().toISOString() : null,
        };
      })
    );
  }

  return { sent, failed, skipped: 0 };
}
