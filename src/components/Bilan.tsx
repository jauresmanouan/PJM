import { useState } from "react";
import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";
import { Badge } from "./ui/badge";

// 2024 : chiffres de l'ancien bilan. 2025 : collection Firestore "users" (relevé du 31/10/2026).
const editions = [
  { year: 2024, roses: 1187, participants: 123, pays: 12 },
  { year: 2025, roses: 752, participants: 93, pays: 8 },
];

export default function Bilan() {
  const [year, setYear] = useState(2025);
  const e = editions.find((x) => x.year === year)!;

  return (
    <section
      id="bilan"
      className="scroll-mt-16 font-Raleway font-black leading-none flex flex-col items-center text-center bg-white px-4 md:px-20 py-16 md:py-24"
    >
      <Badge
        variant="jaune"
        className="text-sm md:text-lg px-4 py-2 rounded-full shadow-md"
      >
        Bilan
      </Badge>
      <p className="text-bleu text-2xl md:text-5xl mt-6 leading-tight">
        Revenir sur nos éditions
      </p>

      <div className="w-full max-w-3xl mt-10 bg-bleu rounded-3xl p-6 md:p-12 flex flex-col items-center">
        <div className="flex gap-3">
          {editions.map((x) => (
            <button
              key={x.year}
              onClick={() => setYear(x.year)}
              aria-pressed={x.year === year}
              className={`rounded-full px-6 py-2 text-base md:text-xl transition-colors duration-200 ${
                x.year === year
                  ? "bg-jaune text-white"
                  : "bg-white/15 text-white active:bg-white/25"
              }`}
            >
              {x.year}
            </button>
          ))}
        </div>

        <div key={year} className="flex flex-col items-center mt-8">
          <AnimatedNumber
            value={e.roses}
            textColor="text-jaune"
            textSize="text-[24vw] md:text-[12vw]"
          />
          <p className="text-white text-[9vw] md:text-[4vw] mt-1">roses offertes</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-5 w-full mt-8">
          <div className="bg-white rounded-2xl py-5 md:py-8">
            <p className="text-jaune text-4xl md:text-6xl">{e.participants}</p>
            <p className="text-bleu text-sm md:text-2xl mt-2">participants</p>
          </div>
          <div className="bg-white rounded-2xl py-5 md:py-8">
            <p className="text-jaune text-4xl md:text-6xl">{e.pays}</p>
            <p className="text-bleu text-sm md:text-2xl mt-2">pays</p>
          </div>
        </div>
      </div>

      <p className="bg-jaune p-3 md:p-6 mt-14 text-white text-base md:text-4xl leading-tight">
        Merci pour ces bouquets 🌹
        <br />
        Rendez-vous le 8 décembre 2026
      </p>
    </section>
  );
}
