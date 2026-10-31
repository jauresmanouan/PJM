import StatsAndDate from "./StatsAndDate";
import Action from "./action/Action";

export default function Accueil() {
  return (
    <section id="accueil" className="scroll-mt-16 flex flex-col justify-center items-center h-screen bg-bleu">
      <StatsAndDate />
      <Action number={1000} action="Roses" />
    </section>
  );
}
