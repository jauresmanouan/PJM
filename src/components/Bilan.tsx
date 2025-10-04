import { AnimatedNumber } from "./ui/skiper-ui/AnimatedNumber";

export default function Bilan() {
  return (
    <div className="font-intro text-black font-black leading-none flex flex-col justify-center items-center ">
      <div className="flex flex-col justify-center h-full p-20 text-black">
        <div className="flex flex-col">
          <AnimatedNumber
            value={1187}
            textColor="text-jaune"
            textSize="text-[12vw]"
          />
          <p className="text-bleu text-[12vw]"> Roses</p>
        </div>
        <div className="flex">
          <AnimatedNumber
            value={123}
            textColor="text-jaune"
            textSize="text-[4vw]"
          />
          <p className="text-bleu text-[4vw]">&nbsp;Participants</p>
        </div>
        <div className="flex">
          <AnimatedNumber
            value={27}
            textColor="text-jaune"
            textSize="text-[4vw]"
          />
          <p className="text-bleu text-[4vw]">&nbsp;Pays</p>
        </div>
      </div>
    </div>
  );
}
