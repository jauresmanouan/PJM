import { useState, useEffect } from "react";
import { getUser } from "@/api/users"; // Importer la fonction pour récupérer les données
import { Users, Heart, Flower, Calendar } from "lucide-react";

export default function StatsAndDate() {
  const [participants, setParticipants] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { participants, totalQuantity } = await getUser();
      setParticipants(participants);
      setTotalQuantity(totalQuantity);
    };

    fetchData();
  }, []);

  return (
    <div className="p-5 font-intro bg-white rounded-3xl mb-10 gap-5 flex justify-center items-center text-bleu">
      <div className="flex items-center space-x-4">
        <Users className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">{participants}</p>{" "}
          {/* Nombre de participants */}
          <p className="text-sm text-bleu">Total participants</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Heart className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">{totalQuantity}</p>{" "}
          {/* Somme des quantités */}
          <p className="text-sm text-bleu">Total promesses</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Flower className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">50</p>{" "}
          {/* Statique pour les roses */}
          <p className="text-sm text-bleu">Total roses restantes</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Calendar className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-2xl font-semibold">8 Dec</p>{" "}
          {/* Jour J statique */}
          <p className="text-sm text-bleu">Jour J</p>
        </div>
      </div>
    </div>
  );
}
