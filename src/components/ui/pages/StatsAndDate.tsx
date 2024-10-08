import { Users, Heart, Flower, Calendar } from "lucide-react";

export default function StatsAndDate() {
  return (
    <div className="p-5 font-intro bg-white rounded-3xl mb-10 gap-5 flex justify-center items-center text-bleu">
      <div className="flex items-center space-x-4">
        <Users className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">150</p>
          <p className="text-sm text-bleu">Total participants</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Heart className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">200</p>
          <p className="text-sm text-bleu">Total promesses</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Flower className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">50</p>
          <p className="text-sm text-bleu">Total roses restantes</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Calendar className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">12 Oct</p>
          <p className="text-sm text-bleu">Jour J</p>
        </div>
      </div>
    </div>
  );
}
