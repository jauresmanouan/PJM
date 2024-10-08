import { useState } from "react";
import FormPage from "./components/ui/pages/FormPage.tsx";
import Accueil from "./components/ui/pages/accueil/Accueil.tsx";
import Context from "./context/Context.tsx";

function App() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClicked = () => {
    setIsClicked(true);
  };
  const contextValue = {
    isClicked,
    setIsClicked,
    handleClicked,
  };

  return (
    <Context.Provider value={contextValue}>
      <div className="h-screen w-screen overflow-hidden">
        <div className="flex justify-center items-center bg-bleu">
          {isClicked ? (
            <div className="flex justify-center items-center h-screen w-screen">
              <FormPage
                actionId={"Roses"}
                actionName={"Nombres de roses"}
                actionQuantity={"Quantité"}
              />
            </div>
          ) : (
            <Accueil />
          )}
        </div>
      </div>
    </Context.Provider>
  );
}
export default App;
