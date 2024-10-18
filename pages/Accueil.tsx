import StatsAndDate from "../src/components/StatsAndDate.jsx";
import Action from "../src/components/action/Action.jsx";

export default function Accueil() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <StatsAndDate />
      <Action number={1000} action="Roses" />
    </div>
  );
}
