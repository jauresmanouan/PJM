const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

export function configured() {
  return Boolean(url && key);
}

export async function supabaseRequest(path: string, init: RequestInit = {}) {
  if (!url || !key) throw new Error("Supabase non configuré");
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  return response;
}
