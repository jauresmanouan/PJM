import { useContext, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/reusable-ui/button";
import { Input } from "@/components/reusable-ui/input";
import { Label } from "@/components/reusable-ui/label";
import ReactFlagsSelect from "react-flags-select";
import { Select } from "@/components/reusable-ui/select";
import { Card, CardContent } from "@/components/reusable-ui/card";
import { creatUser } from "../api/users";
import { Check, CircleX, Loader2 } from "lucide-react";
import Confirmation from "./Confirmation";
import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import context from "@/context/Context";
import { Toaster, toast } from "sonner";

const ease = [0.23, 1, 0.32, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROSES_VISIBLES = 10;

// Chaque champ apparaît avec un léger décalage : le formulaire se « déroule » à l'ouverture.
function Apparition({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  const reduire = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduire ? false : { opacity: 0, transform: "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.25, ease, delay: index * 0.04 }}
    >
      {children}
    </motion.div>
  );
}

// Coche qui apparaît quand le champ est correctement rempli.
function Valide({ ok }: { ok: boolean }) {
  const reduire = useReducedMotion();
  const cache = { opacity: 0, transform: reduire ? "scale(1)" : "scale(0.6)" };
  return (
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
      <AnimatePresence>
        {ok && (
          <motion.span
            key="ok"
            initial={cache}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={cache}
            transition={{ duration: 0.18, ease }}
            className="text-jaune"
          >
            <Check className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// Le bouquet grandit avec le nombre de roses saisi.
function Bouquet({ quantity }: { quantity: number | undefined }) {
  const reduire = useReducedMotion();
  const n = quantity && quantity >= 1 ? Math.min(Math.floor(quantity), 1000) : 0;
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-x-0.5 text-lg" aria-live="polite">
      {n === 0 && <span className="text-sm text-gray-400">Votre bouquet apparaîtra ici</span>}
      <AnimatePresence initial={false}>
        {Array.from({ length: Math.min(n, ROSES_VISIBLES) }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={{ opacity: 0, transform: reduire ? "scale(1)" : "scale(0.5)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: reduire ? "scale(1)" : "scale(0.5)" }}
            transition={{ duration: 0.2, ease }}
          >
            🌹
          </motion.span>
        ))}
      </AnimatePresence>
      {n > ROSES_VISIBLES && <span className="text-sm font-bold text-jaune">+{n - ROSES_VISIBLES}</span>}
      {n > 0 && (
        <span className="basis-full text-sm font-bold text-bleu">
          {n} rose{n > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

export default function FormPage({
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
  const [selected, setSelected] = useState<string>(""); // Assurez-vous que selected est bien une chaîne vide par défaut
  const [firstname, setFirstname] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState<string>("");
  const [envoi, setEnvoi] = useState(false);
  const [termine, setTermine] = useState<{ prenom: string; quantity: number; email: string; emailSent: boolean } | null>(null);
  const { setIsClosedForm, setIsClicked } = useContext(context);
  const reduire = useReducedMotion();

  const ok = {
    nom: firstname.trim().length >= 2,
    prenom: name.trim().length >= 2,
    quantite: quantity !== undefined && quantity >= 1 && quantity <= 1000,
    email: EMAIL.test(email),
  };
  const remplis = Object.values(ok).filter(Boolean).length;

  // Téléphone : l'indicatif suit le pays choisi ; le numéro est mis en forme à la saisie et envoyé au format international.
  const pays = (selected || undefined) as CountryCode | undefined;
  const indicatif = pays ? `+${getCountryCallingCode(pays)}` : "+";
  const analyse = contact.trim() ? parsePhoneNumberFromString(contact, pays) : undefined;
  const numeroValide = Boolean(analyse?.isValid());
  const numero = analyse?.number ?? contact.replace(/[^\d+]/g, "");

  const saisirNumero = (valeur: string) => {
    setContact(new AsYouType(pays).input(valeur));
    // Un numéro international (+33…) permet de deviner le pays quand il n'est pas encore choisi.
    if (!pays && valeur.startsWith("+")) {
      const paysDevine = parsePhoneNumberFromString(valeur)?.country;
      if (paysDevine) setSelected(paysDevine);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (envoi) return;
    if (!ok.quantite || quantity === undefined) {
      toast.error("Indiquez un nombre de roses entre 1 et 1000.");
      return;
    }
    setEnvoi(true);
    try {
      const result = await creatUser({
        newUser: { firstname, name, quantity, email, country: selected, contactMethod, contact: numero },
      });
      setTermine({ prenom: name.trim(), quantity, email: email.trim(), emailSent: result.emailSent });
    } catch (erreur) {
      toast.error(erreur instanceof Error ? erreur.message : "Échec, veuillez réessayer.");
    } finally {
      setEnvoi(false);
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
            toast: "bg-white",
            title: "text-bleu",
            icon: "text-jaune",
          },
        }}
      />
      <Card className="w-full max-w-xs md:max-w-lg font-Raleway font-normal mx-auto p-1 md:p-8 m-5 md:m-0">
        <CardContent className="relative p-8">
          <CircleX
            onClick={handleClosedForm}
            className="text-red-500 absolute w-6 md:w-8 h-6 md:h-8 right-3 md:right-0 top-3 md:top-0 hover:scale-125 cursor-pointer transition ease-out"
          />
          <AnimatePresence mode="wait" initial={false}>
            {termine ? (
              <Confirmation key="confirmation" {...termine} onClose={handleClosedForm} />
            ) : (
              <motion.form
                key="formulaire"
                className="space-y-3 md:space-y-4"
                onSubmit={handleSubmit}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease }}
              >
                <Apparition index={0}>
                  <div className="flex items-center gap-3" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={remplis} aria-label="Progression du formulaire">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full w-full origin-left rounded-full bg-jaune"
                        initial={false}
                        animate={{ transform: `scaleX(${remplis / 4})` }}
                        transition={{ duration: reduire ? 0 : 0.3, ease }}
                      />
                    </div>
                    <span className="text-xs font-bold text-bleu">{remplis}/4</span>
                  </div>
                </Apparition>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Apparition index={1} className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <div className="relative">
                      <Input id="nom" className="pr-10" placeholder="Votre nom" required autoComplete="family-name" value={firstname} onChange={(event) => setFirstname(event.target.value)} />
                      <Valide ok={ok.nom} />
                    </div>
                  </Apparition>
                  <Apparition index={2} className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <div className="relative">
                      <Input id="prenom" className="pr-10" placeholder="Votre prénom" required autoComplete="given-name" value={name} onChange={(event) => setName(event.target.value)} />
                      <Valide ok={ok.prenom} />
                    </div>
                  </Apparition>
                </div>

                <Apparition index={3} className="space-y-2">
                  <Label htmlFor={actionId}>{actionName}</Label>
                  <div className="relative">
                    <Input
                      id={actionId}
                      className="pr-10"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="1000"
                      placeholder={actionQuantity}
                      required
                      value={quantity ?? ""}
                      onChange={(event) => setQuantity(event.target.value === "" ? undefined : Number(event.target.value))}
                    />
                    <Valide ok={ok.quantite} />
                  </div>
                  <Bouquet quantity={ok.quantite ? quantity : undefined} />
                </Apparition>

                <Apparition index={4} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input id="email" className="pr-10" type="email" autoComplete="email" placeholder="votre@email.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    <Valide ok={ok.email} />
                  </div>
                </Apparition>

                <Apparition index={5} className="relative z-10 space-y-2">
                  <Label htmlFor="pays">Pays</Label>
                  <Select>
                    <ReactFlagsSelect
                      id="flags-select"
                      selected={selected}
                      onSelect={(code) => {
                        setSelected(code);
                        setContact((actuel) => new AsYouType(code as CountryCode).input(actuel));
                      }}
                      placeholder="Sélectionner votre pays"
                      searchable
                      searchPlaceholder="Rechercher votre pays"
                    />
                  </Select>
                </Apparition>

                <Apparition index={6} className="space-y-2">
                  <Label>Méthode de contact préférée</Label>
                  <div className="flex space-x-4">
                    <Button type="button" variant={contactMethod === "whatsapp" ? "default" : "outline"} onClick={() => setContactMethod("whatsapp")}>
                      WhatsApp
                    </Button>
                    <Button type="button" variant={contactMethod === "telegram" ? "default" : "outline"} onClick={() => setContactMethod("telegram")}>
                      Telegram
                    </Button>
                  </div>
                </Apparition>

                <Apparition index={7} className="space-y-2">
                  <Label htmlFor="numero">Numéro {contactMethod === "whatsapp" ? "WhatsApp" : "Telegram"}</Label>
                  <div className="flex gap-2">
                    <span className="inline-flex h-10 min-w-[4.5rem] items-center justify-center overflow-hidden rounded-md bg-gray-100 px-3 text-sm font-bold text-bleu" aria-label="Indicatif du pays">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={indicatif}
                          initial={{ opacity: 0, transform: reduire ? "none" : "translateY(6px)" }}
                          animate={{ opacity: 1, transform: "translateY(0px)" }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, ease }}
                        >
                          {indicatif}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <div className="relative flex-1">
                      <Input
                        id="numero"
                        className="pr-10"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder={`Votre numéro ${contactMethod === "whatsapp" ? "WhatsApp" : "Telegram"}`}
                        value={contact}
                        onChange={(event) => saisirNumero(event.target.value)}
                      />
                      <Valide ok={numeroValide} />
                    </div>
                  </div>
                  {contact.trim() && !numeroValide && (
                    <p className="text-xs text-gray-500">
                      {pays ? "Vérifiez votre numéro : il semble incomplet." : "Choisissez votre pays ou commencez par « + » et l'indicatif."}
                    </p>
                  )}
                </Apparition>

                <Apparition index={8} className="flex flex-col justify-center items-center gap-2">
                  <Button type="submit" disabled={envoi} className="w-full gap-2 bg-bleu active:scale-[0.97] transition-transform duration-150">
                    {envoi ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…
                      </>
                    ) : (
                      "Réjouir Marie"
                    )}
                  </Button>
                </Apparition>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  );
}
