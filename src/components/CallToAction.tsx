import { useContext } from "react";
import { Button } from "./reusable-ui/button";
import Context from "@/context/Context";

export default function CallToAction() {
  const { handleClicked } = useContext(Context);

  return (
    <div className="h-60 sm:h-96 bg-fushia flex flex-col space-y-4 justify-center items-center text-center bg-white">
      <p className="font-intro font-semibold text-lg md:text-3xl text-bleu px-5">
        Joignez votre rose aux nôtres et <br />
        offrons à Marie un beau bouquet 
      </p>
      <Button
        onClick={handleClicked}
        className="font-intro w-48 md:w-60 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Participer
      </Button>
    </div>
  );
}
