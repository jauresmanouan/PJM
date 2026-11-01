// Partage d'une participation : texte, lien WhatsApp et image au format « statut » (9:16).
const SITE = "https://pourlajoiedemarie.com";
const DATE = "8 décembre 2026";
const BLEU = "#0A71B8";
const JAUNE = "#F39200";
const POLICE = "Inter, system-ui, -apple-system, Helvetica, Arial, sans-serif";

// L'invitation ne mentionne pas le nombre de roses offertes : chacun donne ce qu'il veut.
export const texteDePartage = () =>
  `Offrons des roses à Marie le ${DATE}, pour sa joie 🌹 Rejoignez-moi : ${SITE}`;

// Ouvre WhatsApp sur le choix d'un contact, message prérempli.
export const lienWhatsApp = () => `https://wa.me/?text=${encodeURIComponent(texteDePartage())}`;

function chargerImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null); // sans logo, l'image reste valable
    image.src = src;
  });
}

function rectangleArrondi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.closePath();
}

export async function genererImage(): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textAlign = "center";

  ctx.fillStyle = BLEU;
  ctx.fillRect(0, 0, W, H);

  // Carte blanche
  ctx.fillStyle = "#ffffff";
  rectangleArrondi(ctx, 70, 250, 940, 1300, 72);
  ctx.fill();

  const logo = await chargerImage("/images/email/logo-v2.png");
  if (logo) ctx.drawImage(logo, 220, 300, 640, 485);

  ctx.fillStyle = BLEU;
  ctx.font = `900 100px ${POLICE}`;
  ctx.fillText("Offrons des roses", W / 2, 990);
  ctx.fillText("à Marie", W / 2, 1110);

  ctx.fillStyle = JAUNE;
  ctx.font = `900 124px ${POLICE}`;
  ctx.fillText("le 8 décembre", W / 2, 1270);

  ctx.fillStyle = "#1f2d3a";
  ctx.font = `600 52px ${POLICE}`;
  ctx.fillText("Fête de l'Immaculée Conception", W / 2, 1360);
  ctx.font = `64px ${POLICE}`;
  ctx.fillText("🌹 🌹 🌹", W / 2, 1480);

  // Appel à rejoindre
  ctx.fillStyle = JAUNE;
  rectangleArrondi(ctx, 120, 1620, 840, 150, 75);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 58px ${POLICE}`;
  ctx.fillText("Rejoignez-moi !", W / 2, 1696);
  ctx.font = `600 40px ${POLICE}`;
  ctx.fillText("pourlajoiedemarie.com", W / 2, 1750);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("image"))), "image/png")
  );
}

export type ResultatPartage = "partage" | "telecharge" | "annule";

// Feuille de partage du téléphone (WhatsApp > « Mon statut ») ; sur ordinateur, l'image est téléchargée.
export async function partagerEnStatut(image: Blob): Promise<ResultatPartage> {
  const fichier = new File([image], "pour-la-joie-de-marie.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], text: texteDePartage() });
      return "partage";
    } catch (erreur) {
      if ((erreur as DOMException).name === "AbortError") return "annule";
    }
  }
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(image);
  lien.download = fichier.name;
  lien.click();
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
  return "telecharge";
}
