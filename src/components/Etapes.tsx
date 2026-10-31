import { Badge } from "./ui/badge";

const etapes = [
  {
    titre: "Je m'inscris",
    texte:
      "Je remplis le formulaire avec le nombre de roses que je veux offrir. Un email confirme ma participation.",
  },
  {
    titre: "J'achète mes roses",
    texte:
      "Je choisis des roses naturelles, de la couleur de mon cœur. Aucun argent n'est à nous transmettre.",
  },
  {
    titre: "Je les dépose le 8 décembre",
    texte:
      "Dans ma paroisse, le jour de l'Immaculée Conception. Le lundi 7 est possible. Nous sommes unis spirituellement.",
  },
];

export default function Etapes() {
  return (
    <section
      id="etapes"
      className="scroll-mt-16 bg-bleu font-Raleway flex flex-col items-center px-6 py-16 md:py-24"
    >
      <Badge
        variant="jaune"
        className="text-sm md:text-lg px-4 py-2 rounded-full shadow-md"
      >
        Comment participer
      </Badge>
      <p className="text-white font-black text-2xl md:text-5xl text-center mt-6 leading-tight">
        Trois gestes pour un bouquet
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 w-full max-w-5xl mt-10">
        {etapes.map((etape, index) => (
          <div
            key={etape.titre}
            className="bg-white rounded-3xl p-8 shadow-md text-left"
          >
            <p className="text-jaune font-black text-7xl md:text-8xl leading-none">
              {index + 1}
            </p>
            <p className="text-bleu font-black text-xl md:text-2xl mt-4 leading-tight">
              {etape.titre}
            </p>
            <p className="text-bleu font-medium text-sm md:text-base mt-3">
              {etape.texte}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
