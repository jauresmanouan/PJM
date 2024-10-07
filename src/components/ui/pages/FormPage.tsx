import { useState } from 'react'
import { Button } from "@/components/ui/reusable-ui/button"
import { Input } from "@/components/ui/reusable-ui/input"
import { Label } from "@/components/ui/reusable-ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/reusable-ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/reusable-ui/card"

export default function Component() {
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'telegram'>('whatsapp')

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Participation</CardTitle>
      </CardHeader>
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
            <Label htmlFor="roses">Nombre de roses</Label>
            <Input id="roses" type="number" min="1" placeholder="Quantité" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pays">Pays</Label>
            <Select>
              <SelectTrigger id="pays">
                <SelectValue placeholder="Sélectionnez votre pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="france">France</SelectItem>
                <SelectItem value="belgique">Belgique</SelectItem>
                <SelectItem value="suisse">Suisse</SelectItem>
                <SelectItem value="canada">Canada</SelectItem>
                {/* Ajoutez d'autres pays selon vos besoins */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Méthode de contact préférée</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={contactMethod === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setContactMethod('whatsapp')}
              >
                WhatsApp
              </Button>
              <Button
                type="button"
                variant={contactMethod === 'telegram' ? 'default' : 'outline'}
                onClick={() => setContactMethod('telegram')}
              >
                Telegram
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">
              Numéro {contactMethod === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
            </Label>
            <Input
              id="numero"
              type="tel"
              placeholder={`Votre numéro ${contactMethod === 'whatsapp' ? 'WhatsApp' : 'Telegram'}`}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Envoyer la commande
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}