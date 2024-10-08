import Action from "./action/Action";


export default function Accueil() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Action number={1000} action="Roses" />
    </div>
  );
}
