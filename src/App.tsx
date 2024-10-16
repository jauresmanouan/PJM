import { useState } from "react";
import FormPage from "./components/ui/pages/FormPage.tsx";
import Accueil from "./components/ui/pages/accueil/Accueil.tsx";
import Context from "./context/Context.tsx";

function App() {
  const [isClicked, setIsClicked] = useState(false);
  const [isClosedForm, setIsClosedForm] = useState(true);

  const handleClicked = () => {
    setIsClicked(true);
    setIsClosedForm(false);

  };
  const contextValue = {
    isClicked,
    setIsClicked,
    handleClicked,
    isClosedForm,
    setIsClosedForm,
  };

  return (
    <Context.Provider value={contextValue}>
      <div className="flex justify-center items-center h-screen w-screen bg-bleu">
        {isClicked && (
          <div className="flex justify-center items-center h-screen w-screen">
            <FormPage
              actionId={"Roses"}
              actionName={"Nombres de roses"}
              actionQuantity={"Quantité"}
            />
          </div>
        ) }
        {isClosedForm && <Accueil/>}
      </div>
    </Context.Provider>
  );
}
export default App;
