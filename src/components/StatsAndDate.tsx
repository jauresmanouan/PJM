import { useState, useEffect } from "react";
import { getUser } from "@/api/users"; // Importer la fonction pour récupérer les données
import { Users, Heart, Flower, Calendar } from "lucide-react";
import restePromesse from "@/utils/restePromesse";

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

  const reste = restePromesse({ objectif: 1000, promesses: totalQuantity });

  return (
    <div className="p-3 md:p-5 m-12 md:m-0 md:relative md:bottom-10 font-intro bg-white rounded-3xl mb-10 gap-2 md:gap-5 grid grid-cols-2 md:flex justify-center items-center text-bleu">
      <div className="flex items-center space-x-4">
        <Users className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl font-semibold">{participants}</p>{" "}
          <p className="text-xs md:text-sm text-bleu">Total participants</p>
        </div>
      </div>
     
      <div className="flex items-center space-x-4">
        <Heart className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl  font-semibold">{totalQuantity}</p>{" "}
          <p className="text-xs md:text-sm text-bleu">Total promesses</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Flower className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl  font-semibold">{reste}</p>{" "}
          <p className="text-xs md:text-sm text-bleu">Total roses restantes</p>
        </div>
      </div>
     
      <div className="flex items-center space-x-4">
        <Calendar className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl  font-semibold">8 Dec</p>{" "}
          <p className="text-xs md:text-sm text-bleu">Jour J</p>
        </div>
      </div>
    </div>
  );
}