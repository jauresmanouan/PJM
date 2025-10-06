import { Button } from "@/components/reusable-ui/button";
import { useContext } from "react";
import context from "@/context/Context";
import logoPJM3 from "../../../public/images/logoPJM3.svg";

export default function Action({
  number,
  action,
}: {
  number: number;
  action: string;
}) {
  const { handleClicked } = useContext(context);

  return (
    <div className="flex flex-col max-md:relative max-md:bottom-10 justify-center items-center">
      <img
        src={logoPJM3}
        alt="logo"
        className="w-20 md:w-40 h-ful mt-8 md:mt-0 mb-4"
      />
      <div className="flex flex-col md:flex-row md:justify-center md:items-center md:gap-20">
        <div className="flex flex-col justify-center items-center">
          <h1 className="flex justify-center items-center">
            <div className="font-Raleway font-black text-4xl md:text-7xl text-jaune">
              {number}
            </div>
            <div className="font-Raleway font-black text-4xl md:text-6xl text-white">
              {action}
            </div>
          </h1>
          <p className="font-Raleway font-medium text-lg md:text-2xl text-white mb-4">
            Pour la Joie de Marie
          </p>
        </div>
      </div>
      <Button
        onClick={handleClicked}
        className="font-Raleway w-48 md:w-60 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Participer
      </Button>
    </div>
  );
}
