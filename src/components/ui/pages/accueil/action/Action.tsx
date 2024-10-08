import { Button } from "@/components/ui/reusable-ui/button";
import FormPage from "../../FormPage.tsx";
import { useContext, useState } from "react";
import context from "@/context/context.tsx";

export default function Action({
  number,
  action,
}: {
  number: number;
  action: string;
}) {
  const { setIsClicked } = useContext(context);

  const handleClicked = () => {
    setIsClicked(true);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <img
        src="../../../../../../public/logoPJM3.svg"
        alt="logo"
        className="w-40 h-full mb-4"
      />
      <div className="flex flex-col md:flex-row md:justify-center md:items-center md:gap-20">
        <div className="flex flex-col justify-center items-center">
          <h1 className="flex justify-center items-center">
            <div className="font-intro font-black text-7xl md:text-7xl text-jaune">
              {number}
            </div>
            <div className="font-intro font-black text-5xl md:text-6xl text-white">
              {action}
            </div>
          </h1>
          <p className="font-intro font-medium  md:text-2xl text-white mb-4">
            Pour la Joie de Marie
          </p>
        </div>
      </div>
      <Button
        onClick={handleClicked}
        className="font-intro w-60 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Participer
      </Button>
    </div>
  );
}
