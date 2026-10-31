import { useState } from "react";
import FormPage from "./components/FormPage";
import Accueil from "./components/Accueil";
import Context from "./context/Context";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Bilan from "./components/Bilan";
import Galerie from "./components/Galerie";
import CallToAction from "./components/CallToAction";
import FAQ from "./components/FAQ";
import Compte from "./components/Compte";
import Etapes from "./components/Etapes";
import RetourHaut from "./components/RetourHaut";

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
      <div className="flex flex-col justify-center items-center min-h-svh w-screen">
        {isClicked && (
          <div className="flex justify-center items-center min-h-svh w-screen bg-bleu">
            <FormPage
              actionId={"Roses"}
              actionName={"Nombres de roses"}
              actionQuantity={"Quantité"}
            />
          </div>
        )}
        {isClosedForm && (
          <div className="w-screen flex flex-col justify-between min-h-svh">
            <Header />
            <div>
              <Accueil />
              <Compte />
              <Etapes />
              <Bilan />
              <Galerie />
              <CallToAction />
              <FAQ />
            </div>
            <Footer />
            <RetourHaut />
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
export default App;
