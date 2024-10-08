import { Button } from "@/components/ui/reusable-ui/button";

export default function Action({
  number,
  action,
}: {
  number: number;
  action: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col md:flex-row md:justify-center md:items-center md:gap-20 border-2 border-red-500">
        <h1 className="flex flex-col justify-center items-center">
          <div className="font-intro font-black text-7xl md:text-8xl text-jaune">
            {number}
          </div>
          <div className="font-intro font-black text-5xl md:text-7xl text-bleu">
            {action}
          </div>
        </h1>
        <img
          src="../../../../../../public/logoPJM2.svg"
          alt="logo"
          className="scale-[2] mt-3"
        />
      </div>
      <Button onClick={() => {}} className="border-2 border-blue-500 font-intro ">
        Participer
      </Button>
    </div>
  );
}
