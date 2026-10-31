import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function RetourHaut() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Retour en haut"
      tabIndex={visible ? 0 : -1}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      className={`fixed bottom-5 right-5 z-30 h-12 w-12 rounded-full bg-jaune text-white shadow-lg p-0 flex items-center justify-center transition-opacity duration-200 active:scale-95 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}
