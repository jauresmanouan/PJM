import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/reusable-ui/button";
import { genererImage, lienWhatsApp, partagerEnStatut, texteDePartage } from "@/lib/partage";

const ease = [0.23, 1, 0.32, 1] as const;

// Roses qui s'élèvent une fois à l'arrivée : feedback de réussite, décoratif (aria-hidden).
const petales = [
  { x: -120, delay: 0.05 }, { x: -70, delay: 0.15 }, { x: -25, delay: 0 }, { x: 25, delay: 0.1 },
  { x: 70, delay: 0.2 }, { x: 120, delay: 0.08 }, { x: -95, delay: 0.25 }, { x: 95, delay: 0.3 },
];

export default function Confirmation({
  prenom,
  quantity,
  email,
  emailSent,
  onClose,
}: {
  prenom: string;
  quantity: number;
  email: string;
  emailSent: boolean;
  onClose: () => void;
}) {
  const reduire = useReducedMotion();
  const titre = useRef<HTMLHeadingElement>(null);
  const [image, setImage] = useState<Blob | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [copie, setCopie] = useState(false);

  useEffect(() => titre.current?.focus(), []);

  useEffect(() => {
    let url: string | null = null;
    let actif = true;
    genererImage(quantity)
      .then((blob) => {
        if (!actif) return;
        url = URL.createObjectURL(blob);
        setImage(blob);
        setApercu(url);
      })
      .catch(() => {});
    return () => {
      actif = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [quantity]);

  const partagerStatut = async () => {
    if (!image) return;
    const resultat = await partagerEnStatut(image, quantity);
    if (resultat === "telecharge") setMessage("Image enregistrée : publiez-la dans votre statut.");
    if (resultat === "partage") setMessage("Merci de faire connaître l'initiative 🌹");
  };

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(texteDePartage(quantity));
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      setMessage("Copie impossible : utilisez le bouton WhatsApp.");
    }
  };

  return (
    <motion.div
      key="confirmation"
      initial={reduire ? false : { opacity: 0, transform: "translateY(12px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.28, ease }}
      className="relative flex flex-col items-center text-center"
    >
      {!reduire && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-8 flex justify-center">
          {petales.map((p) => (
            <motion.span
              key={p.x}
              className="absolute text-2xl"
              initial={{ opacity: 0, transform: "translate(0px, 0px) scale(0.6)" }}
              animate={{ opacity: [0, 1, 0], transform: `translate(${p.x}px, -120px) scale(1)` }}
              transition={{ duration: 1.4, ease, delay: 0.3 + p.delay, times: [0, 0.2, 1] }}
            >
              🌹
            </motion.span>
          ))}
        </div>
      )}

      <svg viewBox="0 0 52 52" className="h-20 w-20" aria-hidden="true">
        <motion.circle
          cx="26" cy="26" r="24" fill="#F39200"
          initial={reduire ? false : { opacity: 0, transform: "scale(0.6)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={{ duration: 0.25, ease }}
          style={{ transformOrigin: "26px 26px" }}
        />
        <motion.path
          d="M15 27 l8 8 l15 -17" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
          initial={reduire ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, ease, delay: 0.2 }}
        />
      </svg>

      <h2 ref={titre} tabIndex={-1} className="mt-4 text-2xl md:text-3xl font-black text-bleu outline-none">
        Merci {prenom} !
      </h2>
      <p className="mt-2 text-base md:text-lg text-bleu" aria-live="polite">
        {quantity > 1 ? "Vos " : "Votre "}
        <strong className="text-jaune font-black">{quantity > 1 ? `${quantity} roses` : "rose"}</strong>, pour le bouquet du 8 décembre.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        {emailSent
          ? `Un email de confirmation est parti à ${email}. Pensez à vérifier vos spams.`
          : "Votre participation est bien enregistrée."}
      </p>

      <div className="mt-6 w-full rounded-2xl bg-bleu p-5 text-white">
        <p className="text-lg md:text-xl font-black">Invitez vos proches à offrir une rose</p>
        <p className="mt-1 text-sm text-white/85">Plus nous serons nombreux, plus le bouquet sera beau.</p>

        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="h-36 w-[81px] shrink-0 overflow-hidden rounded-xl bg-white/15">
            {apercu && <img src={apercu} alt="Aperçu de votre statut" className="h-full w-full object-cover" />}
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
              type="button"
              onClick={partagerStatut}
              disabled={!image}
              className="h-11 w-full gap-2 active:scale-[0.97] transition-transform duration-150"
            >
              <Share2 className="h-4 w-4" /> Partager en statut
            </Button>
            <a
              href={lienWhatsApp(quantity)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-bleu active:scale-[0.97] transition-transform duration-150"
            >
              Inviter un ami sur WhatsApp
            </a>
            <Button
              type="button"
              onClick={copierLien}
              className="h-10 w-full gap-2 bg-white/15 text-white hover:bg-white/25 active:scale-[0.97] transition-transform duration-150"
            >
              {copie ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copie ? "Message copié" : "Copier le message"}
            </Button>
          </div>
        </div>
        <p className="mt-3 min-h-5 text-xs text-white/85" aria-live="polite">{message}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-lg bg-transparent px-4 py-2 text-sm font-bold text-bleu hover:text-jaune active:scale-[0.97] transition-transform duration-150"
      >
        Retour au site
      </button>
    </motion.div>
  );
}
