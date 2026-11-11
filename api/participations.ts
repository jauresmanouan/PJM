import { parsePhoneNumberFromString } from "libphonenumber-js";
import { configured, supabaseRequest } from "./_supabase.js";
import { preflight, withCors } from "./_cors.js";
import { currentEdition, deliver, type Recipient } from "./_deliver.js";

type Input = {
  firstname?: unknown; name?: unknown; quantity?: unknown; email?: unknown;
  country?: unknown; contactMethod?: unknown; contact?: unknown; website?: unknown;
};

// Retire les caractères de contrôle (retours à la ligne, etc.) : le nom finit dans l'objet des emails.
function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

const MAX_ROSES = 1000; // la plus grosse participation connue : 100
const COOLDOWN_MS = 10 * 60 * 1000; // une confirmation par adresse et par tranche de 10 minutes
const HOURLY_CAP = 300; // plafond global de confirmations par heure (2025 : 93 inscrits en tout)

// Protège le domaine d'envoi : sans ça, le formulaire pourrait servir à inonder une boîte mail
// ou à envoyer des milliers d'emails depuis contact@. L'inscription est toujours enregistrée.
async function confirmationAllowed(year: number, email: string) {
  const since = (ms: number) => encodeURIComponent(new Date(Date.now() - ms).toISOString());
  const recent = await supabaseRequest(
    `email_logs?edition_year=eq.${year}&email=eq.${encodeURIComponent(email)}&kind=eq.confirmation&sent_at=gt.${since(COOLDOWN_MS)}&select=id&limit=1`
  );
  if (recent.ok && (await recent.json()).length > 0) return false;
  const hour = await supabaseRequest(`email_logs?kind=eq.confirmation&sent_at=gt.${since(3600_000)}&select=id`, {
    headers: { Prefer: "count=exact", Range: "0-0" },
  });
  const total = Number(hour.headers.get("content-range")?.split("/")[1]);
  return !(total >= HOURLY_CAP);
}

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function POST(request: Request) {
  return withCors(request, await register(request));
}

async function register(request: Request) {
  if (!configured()) return Response.json({ error: "Inscriptions temporairement indisponibles." }, { status: 503 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Format invalide." }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 4000) return Response.json({ error: "Formulaire trop long." }, { status: 413 });
  let input: Input;
  try { input = JSON.parse(raw); } catch { return Response.json({ error: "Formulaire invalide." }, { status: 400 }); }
  if (clean(input.website, 100)) return Response.json({ emailSent: false });

  const firstname = clean(input.firstname, 80);
  const name = clean(input.name, 80);
  const email = clean(input.email, 254).toLowerCase();
  const country = clean(input.country, 2).toUpperCase();
  const contact = clean(input.contact, 40);
  const contactMethod = input.contactMethod === "telegram" ? "telegram" : "whatsapp";
  const quantity = Number(input.quantity);
  if (!firstname || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ROSES) {
    return Response.json({ error: "Vérifiez votre nom, votre email et le nombre de roses." }, { status: 400 });
  }
  // Pays et numéro obligatoires : sans eux, impossible de joindre la personne si l'adresse e-mail est fausse.
  if (!/^[A-Z]{2}$/.test(country) || !parsePhoneNumberFromString(contact)?.isValid()) {
    return Response.json({ error: "Indiquez votre pays et un numéro de contact valide." }, { status: 400 });
  }

  let edition;
  let saved: Recipient | undefined;
  try {
    edition = await currentEdition();
    if (!edition) return Response.json({ error: "Les inscriptions sont closes." }, { status: 409 });

    const response = await supabaseRequest("participations?on_conflict=edition_year%2Cemail&select=email,firstname,name,quantity,unsubscribe_token", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        edition_year: edition.year, firstname, name, email, quantity,
        country: country || null, contact_method: contactMethod, contact: contact || null,
      }),
    });
    if (!response.ok) throw new Error("Supabase write");
    saved = (await response.json())[0];

    // Se réinscrire après un désabonnement volontaire réactive les relances (pas après un rebond ou une plainte).
    await supabaseRequest(`participations?edition_year=eq.${edition.year}&email=eq.${encodeURIComponent(email)}&unsubscribe_reason=eq.user`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ unsubscribed_at: null, unsubscribe_reason: null }),
    });
  } catch {
    return Response.json({ error: "L’inscription n’a pas été enregistrée. Réessayez." }, { status: 502 });
  }

  if (!saved) return Response.json({ emailSent: false });
  if (!(await confirmationAllowed(edition.year, email))) return Response.json({ emailSent: false });
  const result = await deliver(edition, "confirmation", [saved]);
  return Response.json({ emailSent: result.sent === 1 });
}
