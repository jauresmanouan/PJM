import { configured, supabaseRequest } from "./_supabase.js";
import { currentEdition } from "./_deliver.js";

export async function GET() {
  if (!configured()) return Response.json({ error: "Statistiques indisponibles" }, { status: 503 });
  try {
    const edition = await currentEdition();
    if (!edition) throw new Error("Aucune édition ouverte");
    const response = await supabaseRequest("rpc/participation_stats", {
      method: "POST",
      body: JSON.stringify({ edition_year: edition.year }),
    });
    if (!response.ok) throw new Error("Supabase stats");
    const data = await response.json();
    return Response.json({
      participants: Number(data.participants) || 0,
      totalQuantity: Number(data.total_quantity) || 0,
    }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return Response.json({ error: "Statistiques indisponibles" }, { status: 503 });
  }
}
