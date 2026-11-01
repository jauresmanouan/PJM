// Le site (Hostinger) et l'API (Vercel, api.<domaine>) sont sur deux origines : le navigateur exige ces en-têtes.
const ALLOWED = [
  "https://pourlajoiedemarie.com",
  "https://www.pourlajoiedemarie.com",
  "http://localhost:5173",
];

export function withCors(request: Request, response: Response) {
  const origin = request.headers.get("origin") ?? "";
  if (ALLOWED.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function preflight(request: Request) {
  const response = new Response(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "86400");
  return withCors(request, response);
}
