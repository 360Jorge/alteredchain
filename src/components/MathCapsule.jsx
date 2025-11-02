import { useState, useEffect } from 'react';
import MathJaxLoader from './MathJaxLoader';

const CAPSULES = [
  {
    title: 'Modular inverse',
    text: 'For prime $p$, $$a^{-1} \\equiv a^{p-2} \\pmod{p}.$$',
  },
  {
    title: 'Euler’s identity',
    text: 'The most beautiful formula: $$e^{i\\pi} + 1 = 0.$$',
  },
  {
    title: 'Test small cases',
    text: 'Try $n=1,2,3$ first. Small cases reveal patterns.',
  },
  {
    title: 'Track invariants',
    text: 'In combinatorics/dynamics, find what never changes.',
  },
];

export default function MathCapsule() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * CAPSULES.length));

  // auto rotate
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % CAPSULES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // 🔵 1) typeset on *first mount* no matter what
  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      if (typeof window === 'undefined') return;
      const w = window;
      const mj = w.MathJax;

      if (mj?.typesetPromise) {
        mj.typesetPromise();
        return;
      }
      if (mj?.typeset) {
        mj.typeset();
        return;
      }

      // not ready yet → try again
      if (!cancelled) {
        setTimeout(poll, 120);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, []);

  // 🔵 2) re-typeset every time we change tactic
  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      const w = window;
      const mj = w.MathJax;

      if (mj?.typesetPromise) {
        mj.typesetPromise();
        return;
      }
      if (mj?.typeset) {
        mj.typeset();
        return;
      }

      if (!cancelled) {
        setTimeout(poll, 120);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [idx]);

  const c = CAPSULES[idx];

  return (
    <div className="math-capsule">
      {/* this *tries* to load MathJax, but we don't rely on the hydration order */}
      <MathJaxLoader />

      <p className="math-capsule-tag">problem-solving tactics</p>
      <h3>{c.title}</h3>

      {/* we keep this simple, no fade for now to remove all possible “hide before ready” issues */}
      <p dangerouslySetInnerHTML={{ __html: c.text }} />

      <div className="math-capsule-actions">
        <button type="button" onClick={() => setIdx((idx - 1 + CAPSULES.length) % CAPSULES.length)}>
          ← previous
        </button>
        <button type="button" onClick={() => setIdx((idx + 1) % CAPSULES.length)}>
          another →
        </button>
        <a href="/visual-problems" className="capsule-link">
          explore problems →
        </a>
      </div>
    </div>
  );
}
