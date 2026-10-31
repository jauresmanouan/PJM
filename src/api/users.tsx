// Les inscriptions et les statistiques passent par l'API (api/participations.ts, api/stats.ts) :
// Supabase et Resend ne sont jamais appelés depuis le navigateur.

export const getUser = async (): Promise<{
  participants: number;
  totalQuantity: number;
}> => {
  const response = await fetch("/api/stats");
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
  const response = await fetch("/api/participations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Échec de l'inscription");
  return data;
};
