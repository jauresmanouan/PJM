import { useContext, useEffect, useState } from "react";
import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";
import { getUser, type StatsEnDirect } from "../api/users";
import Context from "@/context/Context";
import { Button } from "@/components/reusable-ui/button";

type Pays = { code: string; count: number; roses: number };

// Drapeau emoji et nom français à partir du code pays ISO.
const flag = (code: string) =>
  String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
const regions = new Intl.DisplayNames(["fr"], { type: "region" });
const nom = (code: string) => regions.of(code) ?? code;

// Chiffres issus des exports des participants (PJM-2024 et PJM-2025, non versionnés : données personnelles).
// 2024 : la colonne « pays » n'existait pas, le pays est déduit de l'indicatif des numéros de téléphone
// (méthode contrôlée sur 2025 : 93 numéros sur 93 donnent le bon pays).
// 6 participants de 2024 (28 roses) n'ont aucun pays identifiable : ils ne figurent pas dans `detail`.
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
    fideles: 53, // participants de 2025 déjà inscrits en 2024 (même adresse email)
  },
];

const EDITION_EN_COURS = 2026;
const ACTUALISATION_MS = 30_000;

export default function Bilan() {
  const [year, setYear] = useState(2025);
  const [live, setLive] = useState<StatsEnDirect | null>(null);
  const { handleClicked } = useContext(Context);
  const enDirect = year === EDITION_EN_COURS;

  // Stats de l'édition en cours : chargées une fois, puis actualisées toutes les 30 s tant que l'onglet est affiché.
  useEffect(() => {
    let actif = true;
    const charger = () =>
      getUser()
        .then((stats) => actif && setLive(stats))
        .catch(() => {});
    charger();
    if (!enDirect) return () => { actif = false; };
    const minuteur = setInterval(() => document.visibilityState === "visible" && charger(), ACTUALISATION_MS);
    return () => {
      actif = false;
      clearInterval(minuteur);
    };
  }, [enDirect]);

  const tabs = [...editions.map((x) => x.year), EDITION_EN_COURS];
  const e = enDirect
    ? {
        year,
        roses: live?.totalQuantity ?? 0,
        participants: live?.participants ?? 0,
        detail: (live?.countries ?? []) as Pays[],
        fideles: live && live.participants > 0 ? live.returning : undefined,
      }
    : editions.find((x) => x.year === year)!;
  // Classement par nombre de roses (à égalité, par nombre de participants).
  const [top, ...others] = [...e.detail].sort((a, b) => b.roses - a.roses || b.count - a.count);
  const pays = e.detail.length;
  const pct = (n: number, total: number) => Math.round((n / total) * 100);

  return (
    <section
      id="bilan"
      className="scroll-mt-16 font-Raleway font-black leading-none flex flex-col items-center text-center bg-white px-4 md:px-20 py-16 md:py-24"
    >
      <h2 className="text-bleu text-3xl md:text-6xl leading-tight">
        {enDirect ? `${year} en direct` : `Bilan ${year}`}
      </h2>
      <p className="text-jaune font-bold text-sm md:text-3xl mt-3 leading-snug">
        {enDirect ? "L'édition en cours, mise à jour en temps réel" : "Revenir sur une année de ferveur"}
      </p>

      <div className="w-full max-w-3xl mt-10 bg-bleu rounded-3xl p-6 md:p-12 flex flex-col items-center">
        <div className="flex gap-3">
          {tabs.map((annee) => (
            <button
              key={annee}
              onClick={() => setYear(annee)}
              aria-pressed={annee === year}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-base md:text-xl transition-colors duration-200 ${
                annee === year
                  ? "bg-jaune text-white"
                  : "bg-white/15 text-white active:bg-white/25"
              }`}
            >
              {annee}
              {annee === EDITION_EN_COURS && (
                <span
                  className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400"
                  role="img"
                  aria-label="En direct"
                />
              )}
            </button>
          ))}
        </div>

        <div key={year} className="flex flex-col items-center mt-8">
          <AnimatedNumber
            value={e.roses}
            textColor="text-jaune"
            textSize="text-[24vw] md:text-[12vw]"
          />
          <p className="text-white text-[9vw] md:text-[4vw] mt-1">{enDirect ? "roses promises" : "roses offertes"}</p>
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
              <p className="text-bleu text-sm md:text-2xl mt-2 px-2">{enDirect ? `déjà là avant ${year}` : "déjà là en 2024"}</p>
            </div>
            <div className="bg-white rounded-2xl py-5 md:py-8">
              <p className="text-jaune text-4xl md:text-6xl">{e.participants - e.fideles}</p>
              <p className="text-bleu text-sm md:text-2xl mt-2 px-2">nouveaux</p>
            </div>
          </div>
        )}

        <div className="w-full mt-8 text-left">
          <p className="text-white text-xl md:text-3xl">{enDirect ? "D'où viennent les roses" : "D'où venaient les roses"}</p>
          {top ? (
            <div key={year} className="flex flex-col gap-3 mt-5">
              <div className="bg-white rounded-2xl p-5 md:p-8 flex items-center gap-4 md:gap-8">
                <span aria-hidden="true" className="text-6xl md:text-8xl leading-none">
                  {flag(top.code)}
                </span>
                <div>
                  <p className="text-jaune text-5xl md:text-7xl leading-none">{top.roses}</p>
                  <p className="text-bleu text-base md:text-2xl mt-2">{nom(top.code)}</p>
                  <p className="text-bleu/70 font-medium text-xs md:text-lg mt-1 leading-snug">
                    {top.roses > 1 ? "roses" : "rose"} · {pct(top.roses, e.roses)} % du bouquet
                    <br />
                    {top.count} participant{top.count > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {others.map((p) => (
                  <div key={p.code} className="bg-white rounded-2xl p-4 md:p-6 animate-in fade-in zoom-in-95 duration-300">
                    <span aria-hidden="true" className="text-4xl md:text-6xl leading-none">
                      {flag(p.code)}
                    </span>
                    <p className="text-jaune text-3xl md:text-5xl leading-none mt-3">{p.roses}</p>
                    <p className="text-bleu text-sm md:text-xl mt-1">{nom(p.code)}</p>
                    <p className="text-bleu/70 font-medium text-xs md:text-base mt-1">
                      {p.roses > 1 ? "roses" : "rose"} · {p.count} participant{p.count > 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl bg-white/10 p-6 text-center">
              <p className="text-white text-base md:text-xl leading-snug">
                {live === null
                  ? "Chargement des participants…"
                  : "Les premières roses de 2026 arrivent : soyez le premier à participer."}
              </p>
              {live !== null && (
                <Button onClick={handleClicked} className="h-11 w-48 active:scale-[0.97] transition-transform duration-150">
                  Participer
                </Button>
              )}
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
