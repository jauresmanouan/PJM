"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const AnimatedNumber = ({
  value,
  textSize,
  textColor,
}: {
  value: number;
  textSize: string;
  textColor: string;
}) => {
  const finalCount = value;
  const [displaySubs, setDisplaySubs] = useState(0);

  // Animating sub count from 0 to subscriberCount prop
  const springSubCount = useSpring(0, {
    bounce: 0,
    duration: 1000,
  });

  springSubCount.on("change", (value) => {
    setDisplaySubs(Math.round(value));
  });

  // Visible à l'écran ? Alors une nouvelle valeur (stats en direct) s'anime aussi.
  const visible = useRef(false);
  useEffect(() => {
    if (visible.current) springSubCount.set(finalCount);
  }, [finalCount, springSubCount]);

  const animate = () => {
    visible.current = true;
    springSubCount.set(finalCount);
  };

  return (
    <div className="">
      <motion.div
        onViewportEnter={animate}
        onViewportLeave={() => {
          visible.current = false;
          springSubCount.set(0);
        }}
        className={`font-Raleway ${textSize} ${textColor} tracking-tight`}
      >
        {displaySubs}
      </motion.div>
    </div>
  );
};
