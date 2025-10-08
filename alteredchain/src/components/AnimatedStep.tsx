import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedStepProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedStep({ children, delay = 0 }: AnimatedStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ marginBottom: '1.5rem', background: '#f9f9f9', padding: '1rem' }}
    >
      {children}
    </motion.div>
  );
}
