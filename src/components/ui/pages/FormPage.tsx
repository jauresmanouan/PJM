import { useState } from "react";
import { Button } from "@/components/ui/reusable-ui/button";
import { Input } from "@/components/ui/reusable-ui/input";
import { Label } from "@/components/ui/reusable-ui/label";
import ReactFlagsSelect from "react-flags-select";

import { Select } from "@/components/ui/reusable-ui/select";
import { Card, CardContent } from "@/components/ui/reusable-ui/card";

export default function Component({actionId, actionName, actionQuantity }) {
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "telegram">(
    "whatsapp"
  );
  const [selected, setSelected] = useState("");

  return (
    <Card className="w-full max-w-lg mx-auto pt-8">
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Selectionner votre pays"
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
              required
            />
          </div>
          <Button type="submit" className="w-full bg-bleu">
            Réjouir Marie
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
