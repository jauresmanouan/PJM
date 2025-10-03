import { useState } from "react";
import FormPage from "./components/FormPage";
import Accueil from "./components/Accueil";
import Context from "./context/Context";
import Footer from "./components/Footer";
import HeaderBilan from "./components/HeaderBilan";

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
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        {isClicked && (
          <div className="flex justify-center items-center h-screen w-screen">
            <FormPage
              actionId={"Roses"}
              actionName={"Nombres de roses"}
              actionQuantity={"Quantité"}
            />
          </div>
        )}
        {isClosedForm && (
          <div className="w-screen flex flex-col justify-between h-screen">
            <HeaderBilan />
            <div className="bg-bleu">
              <Accueil />
            </div>
            <Footer />
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
export default App;
