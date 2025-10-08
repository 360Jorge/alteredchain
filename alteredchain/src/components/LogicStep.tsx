import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

type Kind = 'assumption' | 'implication' | 'contradiction' | 'neutral';

interface LogicStepProps {
  children: ReactNode;
  kind?: Kind;
  visible?: boolean;
  delay?: number;
}

export function LogicStep({
  children,
  kind = 'neutral',
  visible = true,
  delay = 0,
}: LogicStepProps) {
  const colorMap: Record<Kind, CSSProperties['color']> = {
    assumption: '#2563eb',      // blue-600
    implication: '#374151',     // gray-700
    contradiction: '#dc2626',   // red-600
    neutral: '#000000',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay }}
          style={{
            color: colorMap[kind],
            fontSize: '1.125rem',
            marginBottom: '1rem',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
