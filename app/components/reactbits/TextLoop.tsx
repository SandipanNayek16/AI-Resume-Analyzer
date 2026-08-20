import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

interface TextLoopProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export function TextLoop({ texts, interval = 2000, className }: TextLoopProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <div className={cn("relative inline-block overflow-hidden", className)} style={{ height: "1.5em" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0"
        >
          {texts[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
