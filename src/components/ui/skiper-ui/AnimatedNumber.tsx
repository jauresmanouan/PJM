"use client";

import { motion, useSpring } from "framer-motion";
import { useState } from "react";

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

  const animate = () => {
    springSubCount.set(finalCount);
  };

  return (
    <div className="">
      <motion.div
        onViewportEnter={animate}
        onViewportLeave={() => {
          springSubCount.set(0);
        }}
        className={`font-intro ${textSize} ${textColor} tracking-tight`}
      >
        {displaySubs}
      </motion.div>
    </div>
  );
};
