import { useState } from "react";
import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";
import { Badge } from "./ui/badge";

type Pays = { code: string; count: number; roses: number };

// Drapeau emoji et nom français à partir du code pays ISO.
const flag = (code: string) =>
  String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
const regions = new Intl.DisplayNames(["fr"], { type: "region" });
const nom = (code: string) => regions.of(code) ?? code;

// Chiffres issus des exports des participants (PJM-2024 et PJM-2025, non versionnés : données personnelles).
// 2024 : la colonne « pays » n'existait pas, le pays est déduit de l'indicatif des numéros de téléphone
// (méthode contrôlée sur 2025 : 93 numéros sur 93 donnent le bon pays). `inconnu` = numéro absent ou ambigu.
const editions = [
  {
    year: 2024,
    roses: 1187,
    participants: 123,
    detail: [
      { code: "CI", count: 89, roses: 782 },
      { code: "CM", count: 13, roses: 200 },
      { code: "FR", count: 4, roses: 25 },
      { code: "US", count: 4, roses: 84 },
      { code: "BF", count: 3, roses: 24 },
      { code: "CA", count: 1, roses: 20 },
      { code: "CD", count: 1, roses: 10 },
      { code: "IT", count: 1, roses: 10 },
      { code: "SN", count: 1, roses: 4 },
    ] as Pays[],
    inconnu: 6,
    inconnuRoses: 28,
    deduit: true,
    fideles: undefined as number | undefined,
  },
  {
    year: 2025,
    roses: 752,
    participants: 93,
    detail: [
      { code: "CI", count: 80, roses: 659 },
      { code: "CM", count: 6, roses: 43 },
      { code: "US", count: 2, roses: 13 },
      { code: "FR", count: 1, roses: 10 },
      { code: "SN", count: 1, roses: 10 },
      { code: "GA", count: 1, roses: 7 },
      { code: "BF", count: 1, roses: 5 },
      { code: "IT", count: 1, roses: 5 },
    ] as Pays[],
    inconnu: 0,
    inconnuRoses: 0,
    deduit: false,
    fideles: 53, // participants de 2025 déjà inscrits en 2024 (même adresse email)
  },
];

export default function Bilan() {
  const [year, setYear] = useState(2025);
  const e = editions.find((x) => x.year === year)!;
  const [top, ...others] = e.detail;
  const medium = others.filter((p) => p.count > 1);
  const singles = others.filter((p) => p.count === 1);
  const pays = e.detail.length;
  const pct = (n: number, total: number) => Math.round((n / total) * 100);

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
            <p className="text-jaune text-4xl md:text-6xl">{pays}</p>
            <p className="text-bleu text-sm md:text-2xl mt-2">pays</p>
          </div>
        </div>

        {e.fideles !== undefined && (
          <div className="grid grid-cols-2 gap-3 md:gap-5 w-full mt-3 md:mt-5">
            <div className="bg-white rounded-2xl py-5 md:py-8">
              <p className="text-jaune text-4xl md:text-6xl">{e.fideles}</p>
              <p className="text-bleu text-sm md:text-2xl mt-2 px-2">déjà là en 2024</p>
            </div>
            <div className="bg-white rounded-2xl py-5 md:py-8">
              <p className="text-jaune text-4xl md:text-6xl">{e.participants - e.fideles}</p>
              <p className="text-bleu text-sm md:text-2xl mt-2 px-2">nouveaux</p>
            </div>
          </div>
        )}

        <div className="w-full mt-8 text-left">
          <p className="text-white text-xl md:text-3xl">D'où venaient les participants</p>
          <div key={year} className="flex flex-col gap-3 mt-5">
              <div className="bg-white rounded-2xl p-5 md:p-8 flex items-center gap-4 md:gap-8">
                <span aria-hidden="true" className="text-6xl md:text-8xl leading-none">
                  {flag(top.code)}
                </span>
                <div>
                  <p className="text-jaune text-5xl md:text-7xl leading-none">{top.count}</p>
                  <p className="text-bleu text-base md:text-2xl mt-2">{nom(top.code)}</p>
                  <p className="text-bleu/70 font-medium text-xs md:text-lg mt-1 leading-snug">
                    {pct(top.count, e.participants)} % des participants
                    <br />
                    {top.roses} roses, {pct(top.roses, e.roses)} % du bouquet
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
                    <p className="text-bleu text-sm md:text-xl mt-1">{nom(p.code)}</p>
                    <p className="text-bleu/70 font-medium text-xs md:text-base mt-1">{p.roses} roses</p>
                  </div>
                ))}
              </div>

              {singles.length > 0 && (
                <p className="text-white/80 font-medium text-xs md:text-base mt-2">
                  1 participant chacun
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {singles.map((p) => (
                  <span
                    key={p.code}
                    className="bg-white/15 text-white rounded-full px-4 py-2 text-sm md:text-lg"
                  >
                    <span aria-hidden="true">{flag(p.code)}</span> {nom(p.code)}
                  </span>
                ))}
              </div>

              {(e.inconnu > 0 || e.deduit) && (
                <p className="text-white/70 font-medium text-xs md:text-sm mt-2 leading-snug">
                  {e.deduit && "Pays déduits des indicatifs téléphoniques. "}
                  {e.inconnu > 0 && `${e.inconnu} participants sans pays identifiable (${e.inconnuRoses} roses).`}
                </p>
              )}
          </div>
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
