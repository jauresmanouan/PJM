import { useState } from "react";
import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";
import { Badge } from "./ui/badge";

type Pays = { code: string; name: string; count: number };

// Drapeau emoji à partir du code pays ISO.
const flag = (code: string) =>
  String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));

// 2024 : chiffres de l'ancien bilan. 2025 : collection Firestore "users" (relevé du 31/10/2026).
const editions = [
  { year: 2024, roses: 1187, participants: 123, pays: 12, detail: [] as Pays[] },
  {
    year: 2025,
    roses: 752,
    participants: 93,
    pays: 8,
    detail: [
      { code: "CI", name: "Côte d'Ivoire", count: 80 },
      { code: "CM", name: "Cameroun", count: 6 },
      { code: "US", name: "États-Unis", count: 2 },
      { code: "BF", name: "Burkina Faso", count: 1 },
      { code: "FR", name: "France", count: 1 },
      { code: "GA", name: "Gabon", count: 1 },
      { code: "IT", name: "Italie", count: 1 },
      { code: "SN", name: "Sénégal", count: 1 },
    ] as Pays[],
  },
];

export default function Bilan() {
  const [year, setYear] = useState(2025);
  const e = editions.find((x) => x.year === year)!;
  const [top, ...others] = e.detail;
  const medium = others.filter((p) => p.count > 1);
  const singles = others.filter((p) => p.count === 1);
  const part = (p: Pays) => Math.round((p.count / e.participants) * 100);

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

        <div className="w-full mt-8 text-left">
          <p className="text-white text-xl md:text-3xl">D'où venaient les participants</p>
          {e.detail.length === 0 ? (
            <p className="text-white/80 font-medium text-sm md:text-lg mt-3 leading-snug">
              Le détail par pays n'a pas été conservé pour {e.year}.
            </p>
          ) : (
            <div key={year} className="flex flex-col gap-3 mt-5">
              <div className="bg-white rounded-2xl p-5 md:p-8 flex items-center gap-4 md:gap-8">
                <span aria-hidden="true" className="text-6xl md:text-8xl leading-none">
                  {flag(top.code)}
                </span>
                <div>
                  <p className="text-jaune text-5xl md:text-7xl leading-none">{top.count}</p>
                  <p className="text-bleu text-base md:text-2xl mt-2">{top.name}</p>
                  <p className="text-bleu/70 font-medium text-xs md:text-lg">
                    {part(top)} % des participants
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {medium.map((p) => (
                  <div key={p.code} className="bg-white rounded-2xl p-4 md:p-6">
                    <span aria-hidden="true" className="text-4xl md:text-6xl leading-none">
                      {flag(p.code)}
                    </span>
                    <p className="text-jaune text-3xl md:text-5xl leading-none mt-3">{p.count}</p>
                    <p className="text-bleu text-sm md:text-xl mt-1">{p.name}</p>
                  </div>
                ))}
              </div>

              <p className="text-white/80 font-medium text-xs md:text-base mt-2">
                1 participant chacun
              </p>
              <div className="flex flex-wrap gap-2">
                {singles.map((p) => (
                  <span
                    key={p.code}
                    className="bg-white/15 text-white rounded-full px-4 py-2 text-sm md:text-lg"
                  >
                    <span aria-hidden="true">{flag(p.code)}</span> {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="bg-jaune rounded-2xl p-3 md:p-6 mt-14 text-white text-base md:text-4xl leading-tight">
        Merci pour ces bouquets 🌹
        <br />
        Rendez-vous le 8 décembre 2026
      </p>
    </section>
  );
}
