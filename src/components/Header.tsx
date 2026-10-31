import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Context from "@/context/Context";
import logo from "../../public/iconePJM.svg";

const links = [
  { href: "#accueil", label: "Accueil" },
  { href: "#bilan", label: "Bilan 2024 · 2025" },
  { href: "#galerie", label: "Galerie" },
  { href: "#participer", label: "Participer" },
  { href: "#faq", label: "Questions" },
];

const ease = [0.23, 1, 0.32, 1] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { handleClicked } = useContext(Context);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white font-Raleway">
      <div className="flex justify-between items-center px-5 md:px-10 py-3">
        <a href="#accueil" className="flex items-center gap-3">
          <img src={logo} alt="" className="w-9 md:w-11" />
          <span className="font-black text-bleu text-base md:text-xl">
            Pour la Joie de Marie
          </span>
        </a>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={isOpen}
          className="bg-transparent p-2 text-bleu hover:text-jaune"
        >
          <Menu className="h-7 w-7 md:h-8 md:w-8" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="menu"
            aria-label="Menu principal"
            className="fixed inset-0 z-50 bg-bleu text-white flex flex-col px-6 md:px-16 py-5 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <div className="flex justify-between items-center">
              <span className="text-jaune font-bold text-sm md:text-base">
                Édition 2026 · 8 décembre
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                className="bg-transparent p-2 text-white hover:text-jaune"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <ul className="flex-1 flex flex-col justify-center gap-2 md:gap-4 py-10">
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{
                    opacity: 0,
                    transform: reduce ? "none" : "translateY(24px)",
                  }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  transition={{ duration: 0.3, ease, delay: 0.05 + index * 0.05 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-baseline gap-4 text-white hover:text-jaune transition-colors duration-200"
                  >
                    <span className="text-jaune font-bold text-sm md:text-lg">
                      0{index + 1}
                    </span>
                    <span className="font-black text-4xl md:text-7xl leading-tight">
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 text-sm">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleClicked();
                }}
                className="bg-jaune text-white font-bold rounded-lg w-48 md:w-60 py-3 hover:bg-white hover:text-bleu transition-colors duration-200"
              >
                Offrir mes roses
              </button>
              <p className="text-white/80">contact@pourlajoiedemarie.com</p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
