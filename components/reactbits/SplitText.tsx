"use client";

import { motion, useReducedMotion } from "motion/react";
import React from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplitText({
  text,
  className = "",
  delay = 0.04,
}: SplitTextProps) {
  const words = text.split(" ");
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: reduce ? 0 : 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block whitespace-nowrap mr-[0.25em]">
          <motion.span variants={child} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
