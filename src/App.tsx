import {useState } from "react";
import FormPage from "./components/ui/pages/FormPage.tsx";
import Accueil from "./components/ui/pages/accueil/Accueil.tsx";
import Context from "./context/context.tsx";

function App() {
  const [isClicked, setIsClicked] = useState(false);

  const contextValue = {
    isClicked,
    setIsClicked
  };

  return (
    <Context.Provider value={contextValue}>
      <div className="flex justify-center items-center h-screen w-screen bg-bleu">
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
    </Context.Provider>
  );
}
export default App;
