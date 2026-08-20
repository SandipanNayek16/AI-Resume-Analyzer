import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

export function PageTransition({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className={cn("w-full h-full", className)}
    >
      {children}
    </motion.div>
  );
}
