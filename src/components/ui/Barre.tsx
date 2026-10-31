import { motion, useReducedMotion } from "framer-motion";

// Remplit son parent (qui fixe hauteur, fond et arrondi) et se déploie à l'entrée dans l'écran.
export default function Barre({ pct, className }: { pct: number; className: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`h-full rounded-full origin-left ${className}`}
      style={{ width: `${Math.min(Math.max(pct, 2), 100)}%` }}
      initial={reduce ? false : { transform: "scaleX(0)" }}
      whileInView={{ transform: "scaleX(1)" }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    />
  );
}
