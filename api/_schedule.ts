export type Kind =
  | "confirmation"
  | "relance_j14"
  | "relance_j7"
  | "relance_j1"
  | "jour_j"
  | "merci"
  | "invitation"; // lancement de l'édition : envoi manuel à d'anciens participants, jamais planifié

export type CampaignKind = Exclude<Kind, "confirmation" | "invitation">;

// Règles d'envoi des campagnes (voir participants_due dans supabase/schema.sql).
//   minAge   : ancienneté minimale de l'inscription (ne pas relancer quelqu'un qui vient de s'inscrire)
//   cooldown : délai minimal depuis le dernier email reçu
export const RULES: Record<CampaignKind, { minAge: string; cooldown: string }> = {
  relance_j14: { minAge: "2 days", cooldown: "5 days" },
  relance_j7: { minAge: "2 days", cooldown: "5 days" },
  relance_j1: { minAge: "1 day", cooldown: "0 days" },
  jour_j: { minAge: "1 day", cooldown: "0 days" },
  merci: { minAge: "1 day", cooldown: "0 days" },
};

export function isCampaignKind(value: unknown): value is CampaignKind {
  return typeof value === "string" && value in RULES;
}

// Nombre de jours entre aujourd'hui (UTC) et la date de l'événement (AAAA-MM-JJ).
export function daysLeft(eventDate: string, now = new Date()) {
  const event = Date.parse(`${eventDate}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((event - today) / 86400000);
}

// Quel email de campagne envoyer aujourd'hui ? Une fenêtre par type : si un envoi est
// repoussé (cooldown, inscription récente), il part un des jours suivants de la même fenêtre.
export function kindForDays(days: number): CampaignKind | null {
  if (days === 0) return "jour_j";
  if (days < 0 && days >= -7) return "merci";
  if (days === 1) return "relance_j1";
  if (days >= 2 && days <= 7) return "relance_j7";
  if (days >= 8 && days <= 14) return "relance_j14";
  return null;
}
