import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export function SplitText({ 
  text, 
  className, 
  delay = 0, 
  duration = 0.5, 
  stagger = 0.05 
}: SplitTextProps) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex flex-wrap gap-x-[0.25em]", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span key={charIndex} className="inline-block">
              {char}
            </span>
          ))}
        </motion.span>
      ))}
    </motion.div>
  );
}
