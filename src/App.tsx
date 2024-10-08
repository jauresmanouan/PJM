import FormPage from "./components/ui/pages/FormPage.tsx";
import Accueil from "./components/ui/pages/accueil/Accueil.tsx";

function App() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <Accueil />
      {/* <div className="flex justify-center items-center h-screen w-screen">
        <FormPage
          actionId={"Roses"}
          actionName={"Nombres de roses"}
          actionQuantity={"Quantité"}
        />
      </div> */}
    </div>
  );
}
export default App;
