// En production le site est chez Hostinger et l'API sur Vercel : VITE_API_URL (voir .env.production).
const API = import.meta.env.VITE_API_URL ?? "";

// Les inscriptions et les statistiques passent par l'API (api/participations.ts, api/stats.ts) :
// Supabase et Resend ne sont jamais appelés depuis le navigateur.

export type StatsEnDirect = {
  year: number;
  participants: number;
  totalQuantity: number;
  countries: { code: string; count: number; roses: number }[];
  unknown: { count: number; roses: number };
  returning: number;
};

export const getUser = async (): Promise<StatsEnDirect> => {
  const response = await fetch(`${API}/api/stats`);
  if (!response.ok) throw new Error("Statistiques indisponibles");
  return response.json();
};

export const creatUser = async ({
  newUser,
}: {
  newUser: {
    firstname: string;
    name: string;
    quantity: number | undefined;
    email: string;
    country: string;
    contactMethod: string;
    contact: string;
  };
}): Promise<{ emailSent: boolean }> => {
  const response = await fetch(`${API}/api/participations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Échec de l'inscription");
  return data;
};
