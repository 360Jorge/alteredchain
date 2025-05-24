import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedStepProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedStep({ children, delay = 0 }: AnimatedStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      style={{ marginBottom: '1rem' }}
    >
      {children}
    </motion.div>
  );
}

