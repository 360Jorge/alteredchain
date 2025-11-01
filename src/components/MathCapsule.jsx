import { useState, useEffect } from 'react';
import MathJaxLoader from './MathJaxLoader';

const CAPSULES = [
  {
    title: 'Euler’s identity',
    text: 'The most beautiful formula: $$e^{i\\pi} + 1 = 0.$$',
  },
  {
    title: 'Binomial trick',
    text: 'Use $$(1 + x)^n = \\sum_{k=0}^n \\binom{n}{k} x^k$$ to expand quickly.',
  },
  {
    title: 'Modular inverse',
    text: 'For prime $p$, $$a^{-1} \\equiv a^{p-2} \\pmod{p}.$$',
  },
  {
    title: 'Track invariants',
    text: 'In dynamical/combinatorial problems, find what never changes. That’s your compass.',
  },
];

export default function MathCapsule() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * CAPSULES.length));
  const [rendering, setRendering] = useState(false);

  // auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % CAPSULES.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // run MathJax every time the text changes
  useEffect(() => {
    setRendering(true);

    const tryTypeset = () => {
      // 1) if MathJax is ready, typeset
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise().then(() => {
          setRendering(false);
        });
      } else if (window.MathJax?.typeset) {
        window.MathJax.typeset();
        setRendering(false);
      }
      // 2) if our loader said "I'm ready", but MathJax not on window yet, try again
      else if (window.__MathJaxReady) {
        // try again in a bit
        setTimeout(tryTypeset, 120);
      }
      // 3) not ready at all yet → wait a bit and re-try
      else {
        setTimeout(tryTypeset, 120);
      }
    };

    // first attempt
    tryTypeset();
  }, [idx]);

  const c = CAPSULES[idx];

  return (
    <div className="math-capsule">
      {/* loads scripts once */}
      <MathJaxLoader />

      <p className="math-capsule-tag">problem-solving tactics</p>
      <h3>{c.title}</h3>

      {/* fade wrapper */}
      <div
        className={`math-capsule-text ${rendering ? 'is-rendering' : 'is-ready'}`}
        dangerouslySetInnerHTML={{ __html: c.text }}
      />

      <div className="math-capsule-actions">
        <button
          type="button"
          className="math-capsule-btn"
          onClick={() => setIdx((idx + 1) % CAPSULES.length)}
        >
          another →
        </button>
        <a href="/visual-problems" className="capsule-link">
          explore problems →
        </a>
      </div>
    </div>
  );
}
