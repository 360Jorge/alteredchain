import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedProofStepProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedProofStep({ children, delay = 0 }: AnimatedProofStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-4 text-lg"
    >
      {children}
    </motion.div>
  );
}

