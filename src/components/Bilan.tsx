import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";
import { Badge } from "./ui/badge";

// 2024 : chiffres de l'ancien bilan. 2025 : collection Firestore "users" (relevé du 31/10/2026).
const editions = [
  { year: 2024, roses: 1187, participants: 123, pays: 12 },
  { year: 2025, roses: 752, participants: 93, pays: 8 },
];

const pays2025 = [
  { name: "Côte d'Ivoire", count: 80 },
  { name: "Cameroun", count: 6 },
  { name: "États-Unis", count: 2 },
  { name: "Burkina Faso", count: 1 },
  { name: "France", count: 1 },
  { name: "Gabon", count: 1 },
  { name: "Italie", count: 1 },
  { name: "Sénégal", count: 1 },
];

const totalRoses = editions.reduce((sum, e) => sum + e.roses, 0);
const totalParticipations = editions.reduce((sum, e) => sum + e.participants, 0);

export default function Bilan() {
  return (
    <section
      id="bilan"
      className="scroll-mt-16 font-Raleway font-black leading-none flex flex-col items-center bg-white px-6 md:px-20 py-16 md:py-24"
    >
      <Badge
        variant="jaune"
        className="text-sm md:text-lg px-4 py-2 rounded-full shadow-md"
      >
        Bilan 2024 · 2025
      </Badge>
      <p className="text-jaune font-bold text-sm md:text-2xl mt-4 leading-snug">
        Revenir sur deux années de ferveur
      </p>

      <div className="flex flex-col mt-10">
        <AnimatedNumber
          value={totalRoses}
          textColor="text-jaune"
          textSize="text-[18vw]"
        />
        <p className="text-bleu text-[9vw] md:text-[7vw]">roses offertes</p>
        <p className="text-bleu font-medium text-sm md:text-2xl mt-3 leading-snug">
          par {totalParticipations} participations, depuis la première édition
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 w-full max-w-5xl mt-14">
        {editions.map((e) => (
          <div
            key={e.year}
            className="bg-bleu text-white rounded-3xl p-8 md:p-10 text-left"
          >
            <p className="text-jaune text-5xl md:text-7xl">{e.year}</p>
            <div className="flex items-baseline gap-3 mt-6">
              <AnimatedNumber
                value={e.roses}
                textColor="text-white"
                textSize="text-5xl md:text-6xl"
              />
              <span className="text-xl md:text-2xl">roses</span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 font-bold text-base md:text-xl">
              <p>
                <span className="text-jaune">{e.participants}</span> participants
              </p>
              <p>
                <span className="text-jaune">{e.pays}</span> pays
              </p>
              <p>
                <span className="text-jaune">
                  {(e.roses / e.participants).toFixed(1).replace(".", ",")}
                </span>{" "}
                roses par personne
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-5xl mt-14 text-left">
        <p className="text-bleu text-2xl md:text-4xl">
          D'où venaient les participants en 2025
        </p>
        <ul className="flex flex-wrap gap-3 mt-6 font-bold text-sm md:text-lg">
          {pays2025.map((p, index) => (
            <li
              key={p.name}
              className={`rounded-full px-4 py-2 ${
                index === 0 ? "bg-jaune text-white" : "bg-blue-50 text-bleu"
              }`}
            >
              {p.name} <span className={index === 0 ? "" : "text-jaune"}>{p.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="bg-jaune p-3 md:p-6 mt-14 text-white text-base md:text-5xl leading-tight">
        Merci pour ces deux bouquets 🌹
        <br />
        Rendez-vous le 8 décembre 2026
      </p>
    </section>
  );
}
