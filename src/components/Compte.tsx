import { useEffect, useState } from "react";
import { getUser } from "../api/users";
import Barre from "./ui/Barre";

const OBJECTIF = 1000;
const JOUR_J = new Date(2026, 11, 8);

export default function Compte() {
  const [roses, setRoses] = useState(0);
  const jours = Math.max(0, Math.ceil((JOUR_J.getTime() - Date.now()) / 86400000));

  useEffect(() => {
    getUser().then((d) => setRoses(d.totalQuantity)).catch(() => {});
  }, []);

  return (
    <section className="bg-white font-Raleway font-black flex flex-col items-center text-center px-6 py-16 md:py-24">
      <p className="text-jaune font-bold text-sm md:text-2xl">
        Édition 2026
      </p>
      <p className="text-jaune leading-none text-[28vw] md:text-[18vw]">
        {jours > 0 ? jours : "Jour J"}
      </p>
      <p className="text-bleu text-[8vw] md:text-[5vw] leading-none">
        {jours > 1 ? "jours" : jours === 1 ? "jour" : "8 décembre"}
      </p>
      <p className="text-bleu font-medium text-sm md:text-2xl mt-4">
        avant le dépôt des roses, le mardi 8 décembre
      </p>

      <div className="w-full max-w-3xl mt-14 bg-bleu rounded-3xl p-6 md:p-10">
        <div className="flex justify-between items-baseline text-white">
          <p className="text-base md:text-2xl">Roses promises</p>
          <p className="text-base md:text-2xl">
            <span className="text-jaune">{roses}</span> / {OBJECTIF}
          </p>
        </div>
        <div className="h-4 md:h-6 rounded-full bg-white mt-4">
          <Barre pct={(roses / OBJECTIF) * 100} className="bg-jaune" />
        </div>
        <p className="text-white font-medium text-xs md:text-lg mt-4 text-left">
          {roses > OBJECTIF
            ? `Objectif dépassé de ${roses - OBJECTIF} roses : merci pour ce beau bouquet 🌹`
            : `Notre objectif : un bouquet de ${OBJECTIF} roses offertes à Marie.`}
        </p>
      </div>
    </section>
  );
}
