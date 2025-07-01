import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { proofSteps} from '@components/proofSteps';
import type { Kind } from '@components/proofSteps';

const colorMap: Record<Kind, string> = {
  assumption: '#2563eb',
  implication: '#374151',
  contradiction: '#dc2626',
  neutral: '#000000',
};

export function ProofWithSteps() {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < proofSteps.length) {
      setIndex(index + 1);
    }
  };

  useEffect(() => {
    const waitForMathJax = () => {
      const mj = (window as any).MathJax;
  
      if ((window as any).__MathJaxReady && mj?.typeset) {
        mj.typeset();
      } else {
        setTimeout(waitForMathJax, 50); // 🌀 keep trying until ready
      }
    };
  
    waitForMathJax();
  }, [index]);
  

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      {proofSteps.slice(0, index).map((step, i) => (
        <AnimatePresence key={i}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              color: colorMap[step.kind],
              fontSize: '1.125rem',
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            <span
              style={{
                borderBottom: '1px dotted gray',
                cursor: 'help',
              }}
              title={step.support}
            >
              {step.text}
            </span>
          </motion.div>
        </AnimatePresence>
      ))}

      {index < proofSteps.length && (
        <button
          onClick={next}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Next Step →
        </button>
      )}
    </div>
  );
}


export default ProofWithSteps;
