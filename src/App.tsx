import FormPage from "./components/ui/pages/FormPage.tsx";

function App() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <FormPage actionId={"Roses"} actionName={"Nombres de roses"} actionQuantity={"Quantité"} />
    </div>
  );
}
export default App;
