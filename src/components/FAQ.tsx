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
        "Non. Vous achetez vous-même le nombre de roses que vous souhaitez offrir, puis vous les déposez le 8 décembre, jour dédié à l'Immaculée Conception de Marie.",
    },
    {
      value: "rencontre-depot",
      question: "Devons-nous nous rencontrer pour le dépôt des roses ?",
      answer:
        "Non. Le dépôt des roses se fait directement sur votre paroisse. Nous serons unis spirituellement en ce jour.",
    },
    {
      value: "type-roses",
      question: "Quel type de roses devrais-je offrir ?",
      answer:
        "Nous vous invitons à choisir des roses naturelles, symboles de beauté, de pureté et de gratitude. La couleur est libre, chaque teinte exprime une tension particulière de votre cœur.",
    },
    {
      value: "confirmation-participation",
      question:
        "Comment savoir si ma participation a bien été prise en compte ?",
      answer:
        "Après avoir rempli le formulaire, vous recevrez un email de confirmation. Celui-ci récapitule votre message et confirme votre participation. Si vous ne le recevez pas rapidement, vérifiez votre dossier spam ou contactez-nous.",
    },
    {
      value: "changement-participation",
      question: "Comment modifier le nombre de roses que j’ai choisi ?",
      answer:
        "Il vous suffit de remplir à nouveau le formulaire avec le nouveau nombre de roses 🌹. Votre dernière soumission remplacera la précédente, et un nouvel email de confirmation vous sera envoyé pour valider votre participation.",
    },
    {
      value: "jour-ouvrable",
      question:
        "Puis-je déposer mes roses un jour avant, le dimanche 7 décembre, si le 8 décembre tombe un lundi ?",
      answer:
        "Oui. Si vous ne pouvez pas déposer vos roses le lundi 8 décembre, vous pouvez les déposer dès le dimanche 7 décembre dans votre paroisse.",
    },
    {
      value: "origine-du-projet",
      question: "Pourquoi ce projet s’appelle « Pour la Joie de Marie » ?",
      answer:
        "Tout simplement pour réjouir le cœur uni de Jésus et Marie 😁. Leur cœur étant uni, la joie de l'un fait celle de l'autre, et Marie a été pour de nombreux saints un excellent chemin vers Jésus.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-bleu px-4 font-Raleway">
      <div className="flex flex-col justify-center items-center w-full max-w-2xl bg-white rounded-2xl shadow-md p-8 space-y-6">
        <Badge
          variant="jaune"
          className="mx-auto text-sm md:text-lg px-4 py-2 rounded-full shadow-sm"
        >
          Questions fréquentes
        </Badge>
        <p className="text-center">Ce qu'il faut savoir avant le 8 décembre</p>

        <Accordion
          className="w-full space-y-2 mb-10"
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
