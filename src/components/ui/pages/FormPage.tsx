import { useState } from "react";
import { Button } from "@/components/ui/reusable-ui/button";
import { Input } from "@/components/ui/reusable-ui/input";
import { Label } from "@/components/ui/reusable-ui/label";
import ReactFlagsSelect from "react-flags-select";
import { Select } from "@/components/ui/reusable-ui/select";
import { Card, CardContent } from "@/components/ui/reusable-ui/card";

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

  return (
    <Card className="w-full max-w-lg font-intro font-normal mx-auto p-4 sm:p-6 md:p-8">
      {/* @TODO : Add canceled button */}
      <CardContent>
        <form className="space-y-4">
          {/* Form Layout with Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" placeholder="Votre nom" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" placeholder="Votre prénom" required />
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              required
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

          {/* Contact Method Section */}
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

          {/* Phone Input */}
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
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col justify-center items-center gap-2">
            <Button type="submit" className="w-full bg-bleu">
              Réjouir Marie
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
