import { configured, supabaseRequest } from "./_supabase.js";
import { preflight, withCors } from "./_cors.js";
import { currentEdition } from "./_deliver.js";

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(request: Request) {
  return withCors(request, await stats());
}

async function stats() {
  if (!configured()) return Response.json({ error: "Statistiques indisponibles" }, { status: 503 });
  try {
    const edition = await currentEdition();
    if (!edition) throw new Error("Aucune édition ouverte");
    const response = await supabaseRequest("rpc/edition_breakdown", {
      method: "POST",
      body: JSON.stringify({ p_year: edition.year }),
    });
    if (!response.ok) throw new Error("Supabase stats");
    const data = await response.json();
    return Response.json({
      year: edition.year,
      participants: Number(data.participants) || 0,
      totalQuantity: Number(data.total_quantity) || 0,
      countries: (data.countries ?? []).map((c: { code: string; count: number; roses: number }) => ({
        code: c.code, count: Number(c.count) || 0, roses: Number(c.roses) || 0,
      })),
      returning: Number(data.returning) || 0,
      unknown: { count: Number(data.unknown?.count) || 0, roses: Number(data.unknown?.roses) || 0 },
    }, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } });
  } catch {
    return Response.json({ error: "Statistiques indisponibles" }, { status: 503 });
  }
}
