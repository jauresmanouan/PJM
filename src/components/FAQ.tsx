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
        "Non 💐. Vous achetez vous-même le nombre de roses que vous souhaitez offrir, puis vous les déposez le 8 décembre, jour dédié à l'Immaculée Conception de Marie.",
    },
    {
      value: "rencontre-depot",
      question: "Devons-nous nous rencontrer pour le dépôt des roses ?",
      answer:
        "Non 🌹. Le dépôt des roses se fait directement sur votre paroisse. Chacun participe depuis son lieu de prière, dans un même élan d’amour et de foi.",
    },
    {
      value: "type-roses",
      question: "Quel type de roses devrais-je offrir ?",
      answer:
        "Nous vous invitons à choisir des roses fraîches, symboles de beauté, de pureté et de gratitude. La couleur est libre : chaque teinte exprime une tension particulière de votre cœur.",
    },
    {
      value: "confirmation-participation",
      question:
        "Comment savoir si ma participation a bien été prise en compte ?",
      answer:
        "Après avoir rempli le formulaire, vous recevrez un email de confirmation. Celui-ci récapitule votre message et confirme votre participation. Si vous ne le recevez pas rapidement, vérifiez votre dossier spam ou contactez-nous.",
    },
    {
      value: "origine-du-projet",
      question:
        "Pourquoi cette initiative s'appelle-t-elle « Pour la Joie de Marie » ?",
      answer:
        "Ce projet est une offrande de cœur : un élan d’amour vers Jésus ❤️‍🔥, porté par la tendresse que nous avons pour sa Mère. Chaque rose déposée est un mot doux, un geste gratuit. Et tous ensemble, nous formons un seul et même bouquet, celui de nos cœurs unis, offert à Marie pour sa joie et celle de son Fils.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bleu px-4 font-intro">
      <div className="flex flex-col justify-center items-center w-full max-w-2xl bg-white rounded-2xl shadow-md p-8 space-y-6">
        <Badge
          variant="jaune"
          className="mx-auto text-lg px-4 py-2 rounded-full shadow-sm"
        >
          Questions fréquentes
        </Badge>
        <p>Ce qu'il faut savoir avant le 8 décembre</p>

        <Accordion
          className="w-full space-y-2"
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.value}
              value={faq.value}
              className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md"
            >
              <AccordionTrigger className="bg-white flex items-center justify-between w-full px-5 py-4 text-left hover:border-none focus:outline-none focus:border-none focus:ring-0">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5"/>
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
