import { configured, supabaseRequest } from "./_supabase";
import { currentEdition, deliver, type Recipient } from "./_deliver";

type Input = {
  firstname?: unknown; name?: unknown; quantity?: unknown; email?: unknown;
  country?: unknown; contactMethod?: unknown; contact?: unknown; website?: unknown;
};

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
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
  if (!firstname || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000 || (country && !/^[A-Z]{2}$/.test(country))) {
    return Response.json({ error: "Vérifiez votre nom, votre email et le nombre de roses." }, { status: 400 });
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
  const result = await deliver(edition, "confirmation", [saved]);
  return Response.json({ emailSent: result.sent === 1 });
}
