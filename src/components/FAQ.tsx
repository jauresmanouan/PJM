import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/motion-primitives/accordion";
import { ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";

export default function FAQ() {
  const faqs = [
    {
      value: "paiement-roses",
      question: "Dois-je vous transmettre de l'argent pour l'achat de roses ?",
      answer:
        "Non 💐. Vous achetez vous-même le nombre de roses que vous souhaitez offrir, puis vous les déposez le 8 décembre, jour dédié à Marie.",
    },
    {
      value: "rencontre-depot",
      question: "Devons-nous nous rencontrer pour le dépôt des roses ?",
      answer:
        "Pas nécessairement 🌹. Le dépôt des roses se fait directement sur votre paroisse d’origine. Chacun participe depuis son lieu de prière, dans un même élan d’amour et de foi.",
    },
    {
      value: "type-roses",
      question: "Quel type de roses devrais-je offrir ?",
      answer:
        "Nous vous invitons à choisir des roses fraîches, symboles de beauté, de pureté et de gratitude 🌷. La couleur est libre : chaque teinte exprime une intention particulière selon votre cœur.",
    },
    {
      value: "confirmation-participation",
      question:
        "Comment savoir si ma participation a bien été prise en compte ?",
      answer:
        "Après avoir rempli le formulaire, vous recevrez un email de confirmation 🌼. Celui-ci récapitule votre message et confirme votre participation. Si vous ne le recevez pas rapidement, vérifiez votre dossier spam ou contactez-nous.",
    },
    {
      value: "origine-du-projet",
      question: "Pourquoi ce projet s'appelle-t-il « Pour la Joie de Marie » ?",
      answer:
        "Ce projet est né du désir de célébrer Marie à travers un geste simple et symbolique : offrir des roses en signe d’amour, de reconnaissance et de foi 🌺. Chaque rose déposée est une prière de joie et de lumière.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bleu px-4 font-intro">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8 space-y-6">
        <Badge
          variant="jaune"
          className="mx-auto text-lg px-4 py-2 rounded-full shadow-sm"
        >
          Questions fréquentes
        </Badge>

        <Accordion className="w-full space-y-2">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.value}
              value={faq.value}
              className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md "
            >
              <AccordionTrigger className="flex items-center justify-between w-full px-5 py-4 text-left bg-white hover:bg-gray-50 hover:border-none focus:outline-none focus:border-none focus:ring-0">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5" />
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 pt-4 bg-blue-50 font-medium">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
