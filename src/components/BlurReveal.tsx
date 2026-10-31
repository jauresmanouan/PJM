import { useLayoutEffect, useRef } from "react";

// Chaque enfant direct d'une <section> apparaît en passant du flou au net (classe .blur-in, voir index.css).
export default function BlurReveal({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("section > *") ?? []);
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { threshold: 0.1 }
    );
    items.forEach((item, index) => {
      item.classList.add("blur-in");
      item.style.transitionDelay = `${(index % 4) * 80}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
