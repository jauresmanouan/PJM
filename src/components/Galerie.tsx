import { Badge } from "./ui/badge";

export default function Galerie() {
  return (
    <div className="bg-white h-80 flex justify-center items-center flex-col">
      <Badge variant={"bleu"}>Quelques images</Badge>
      <img src="/images/galeries/invité_1.jpg" alt="invité_1" />
    </div>
  );
}
