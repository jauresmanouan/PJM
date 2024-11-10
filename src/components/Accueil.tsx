import StatsAndDate from "./StatsAndDate";
import Action from "./action/Action";

export default function Accueil() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <StatsAndDate />
      <Action number={1000} action="Roses" />
    </div>
  );
}
