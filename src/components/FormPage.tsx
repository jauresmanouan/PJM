import { useContext, useState } from "react";
import { Button } from "@/components/reusable-ui/button";
import { Input } from "@/components/reusable-ui/input";
import { Label } from "@/components/reusable-ui/label";
import ReactFlagsSelect from "react-flags-select";
import { Select } from "@/components/reusable-ui/select";
import { Card, CardContent } from "@/components/reusable-ui/card";
import { creatUser } from "../../pages/api/users.tsx";
import { CircleX } from "lucide-react";
import context from "@/context/Context";
import { Toaster, toast } from 'sonner';


export default function Component({
  actionId,
  actionName,
  actionQuantity,
}: {
  actionId: string;
  actionName: string;
  actionQuantity: string;
}) {
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "telegram">(
    "whatsapp"
  );
  const [selected, setSelected] = useState("");

  const [firstname, setFirstname] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState<string>("");
  const { setIsClosedForm, setIsClicked } = useContext(context);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      firstname,
      name,
      quantity,
      email,
      country: selected,
      contactMethod,
      contact,
    };

    await toast.promise(
      creatUser({ newUser: formData }).then(()=> sendToAPI(formData.name, formData.quantity)).then(()=> setTimeout(() => {
        window.location.reload()
       }, 2500)), 
      {
        loading : "Enregistrement en cours...",
        success: "Nom enregistré et mail envoyé avec succès",
        error : "Echec veuillez réessayer"
      }
    )

   
  }
  const sendToAPI = async (name: string, quantity: number | undefined) => {
    try {
      await fetch("http://localhost:3000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, email }),
      });
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const handleClosedForm = () => {
    setIsClosedForm(true);
    setIsClicked(false);
  };

  return (
    <>
          <Toaster 
          toastOptions={{
    unstyled: false,
  
    classNames: {
      toast: 'bg-white',
      title: 'text-bleu',
      icon: "text-jaune"
    },
  }}/>
          <Card className="w-full max-w-xs md:max-w-lg font-intro font-normal mx-auto p-1 md:p-8 m-5 md:m-0">
      <CardContent className="relative p-8">
        <CircleX
          onClick={handleClosedForm}
          className="text-red-500 absolute w-6 md:w-8 h-6 md:h-8 right-3 md:right-0 top-3 md:top-0 hover:scale-125 cursor-pointer transition ease-out"
        />
        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Votre nom"
                required
                value={firstname}
                onChange={(event) => setFirstname(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                placeholder="Votre prénom"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={actionId}>{actionName}</Label>
            <Input
              id={actionId}
              type="number"
              min="1"
              placeholder={actionQuantity}
              required
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pays">Pays</Label>
            <Select>
              <ReactFlagsSelect
                id="flags-select"
                selected={selected}
                onSelect={(code) => setSelected(code)}
                placeholder="Sélectionner votre pays"
                searchable
                searchPlaceholder="Rechercher votre pays"
              />
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Méthode de contact préférée</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={contactMethod === "whatsapp" ? "default" : "outline"}
                onClick={() => setContactMethod("whatsapp")}
              >
                WhatsApp
              </Button>
              <Button
                type="button"
                variant={contactMethod === "telegram" ? "default" : "outline"}
                onClick={() => setContactMethod("telegram")}
              >
                Telegram
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">
              Numéro {contactMethod === "whatsapp" ? "WhatsApp" : "Telegram"}
            </Label>
            <Input
              id="numero"
              type="tel"
              placeholder={`Votre numéro ${
                contactMethod === "whatsapp" ? "WhatsApp" : "Telegram"
              }`}
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>

          <div className="flex flex-col justify-center items-center gap-2">
            <Button type="submit" className="w-full bg-bleu">
              Réjouir Marie
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    </>

  );
}
