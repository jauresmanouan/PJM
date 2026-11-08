import { createHmac, timingSafeEqual } from "node:crypto";

export type MailConfig = { key: string; from: string; replyTo: string; siteUrl: string; apiUrl: string; logoUrl: string };

// RESEND_FROM_EMAIL : ex. « Pour la Joie de Marie <contact@pourlajoiedemarie.com> » (domaine vérifié dans Resend).
export function mailConfig(): MailConfig | null {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return null;
  const siteUrl = (process.env.SITE_URL || "https://pourlajoiedemarie.com").replace(/\/$/, "");
  return {
    key,
    from,
    replyTo: process.env.RESEND_REPLY_TO || "contact@pourlajoiedemarie.com",
    siteUrl,
    // Adresse publique de l'API (désabonnement). L'API est servie sur api.<domaine>.
    apiUrl: (process.env.API_URL || siteUrl).replace(/\/$/, ""),
    // Le logo des emails est dans un bucket public Supabase : indépendant de l'hébergement du site.
    logoUrl:
      process.env.EMAIL_LOGO_URL ||
      `${(process.env.SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/email-assets/logo-v2.png`,
  };
}

export type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
};

// Envoi groupé (max 100 par appel, on reste à 50). Retourne un id Resend par message, null si échec.
export async function sendBatch(
  config: MailConfig,
  messages: Message[],
  idempotencyKey?: string
): Promise<{ ids: (string | null)[]; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(
        messages.map((m) => ({
          from: config.from,
          to: [m.to],
          reply_to: config.replyTo,
          subject: m.subject,
          html: m.html,
          text: m.text,
          headers: m.headers,
        }))
      ),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ids: messages.map(() => null), error: `Resend ${response.status}: ${data?.message ?? "erreur"}` };
    }
    const ids = messages.map((_, i) => (data?.data?.[i]?.id as string | undefined) ?? null);
    return { ids };
  } catch (error) {
    return { ids: messages.map(() => null), error: error instanceof Error ? error.message : "réseau" };
  }
}

// Vérifie la signature d'un webhook Resend (format Svix) : HMAC-SHA256 de « id.timestamp.corps ».
export function verifyWebhook(secret: string, headers: Headers, body: string, now = Date.now()) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;
  if (Math.abs(now / 1000 - Number(timestamp)) > 300) return false;

  const expected = createHmac("sha256", Buffer.from(secret.replace(/^whsec_/, ""), "base64"))
    .update(`${id}.${timestamp}.${body}`)
    .digest();

  return signatures.split(" ").some((entry) => {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) return false;
    const received = Buffer.from(value, "base64");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}
