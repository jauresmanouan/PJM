import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";
import { Badge } from "./ui/badge";
import Barre from "./ui/Barre";

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

      <div className="flex flex-col items-center text-center mt-10">
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-8 w-full max-w-5xl mt-14 text-left">
        <div className="md:col-span-2 bg-jaune text-white rounded-3xl p-8 md:p-10 flex flex-col justify-center items-center text-center md:items-start md:text-left">
          <p className="text-white text-7xl md:text-8xl leading-none">
            {Math.round((pays2025[0].count / editions[1].participants) * 100)} %
          </p>
          <p className="text-lg md:text-2xl mt-4 leading-snug">
            des participants de 2025 venaient de {pays2025[0].name}
          </p>
        </div>
        <div className="md:col-span-3 bg-bleu text-white rounded-3xl p-6 md:p-10">
          <p className="text-white text-2xl md:text-4xl">Les pays en 2025</p>
          <div className="flex flex-col gap-3 mt-6 text-sm md:text-lg">
            {pays2025.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-28 md:w-40 shrink-0">{p.name}</span>
                <div className="flex-1 h-3 md:h-4 rounded-full bg-white/25">
                  <Barre pct={(p.count / pays2025[0].count) * 100} className="bg-jaune" />
                </div>
                <span className="w-8 text-right">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="bg-jaune p-3 md:p-6 mt-14 text-white text-base md:text-5xl leading-tight">
        Merci pour ces deux bouquets 🌹
        <br />
        Rendez-vous le 8 décembre 2026
      </p>
    </section>
  );
}
