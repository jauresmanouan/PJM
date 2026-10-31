import { useState, useEffect } from "react";
import { getUser } from "../api/users"; // Importer la fonction pour récupérer les données
import { Users, Heart, Calendar } from "lucide-react";

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
    <div className="p-3 md:p-5 m-6 md:m-0 md:relative md:bottom-10 font-Raleway bg-white rounded-3xl mb-10 gap-5 md:gap-5 flex flex-row items-start text-center justify-center text-bleu">
      <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 md:text-left">
        <Users className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl font-semibold">{participants}</p>
          <p className="text-xs md:text-sm text-bleu">Participants</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 md:text-left">
        <Heart className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl  font-semibold">{totalQuantity}</p>
          <p className="text-xs md:text-sm text-bleu">Roses promises</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 md:text-left">
        <Calendar className="h-6 w-6 text-jaune" />
        <div>
          <p className="text-lg md:text-2xl  font-semibold">8 Dec</p>
          <p className="text-xs md:text-sm text-bleu">Jour J</p>
        </div>
      </div>
    </div>
  );
}
