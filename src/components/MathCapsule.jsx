import { useState, useEffect } from 'react';

const CAPSULES = [
  {
    title: 'Look for symmetry',
    text: 'Before calculating, check if the problem stays the same under reflection, rotation, or permutation.',
  },
  {
    title: 'Test small cases',
    text: 'Try n = 1, 2, 3 first. Small cases reveal patterns and catch mistakes early.',
  },
  {
    title: 'Count in two ways',
    text: 'If you can count something in two valid ways, you get an identity — classic olympiad move.',
  },
  {
    title: 'Track invariants',
    text: 'In dynamical/combinatorial problems, find what never changes. That’s your compass.',
  },
  {
    title: 'Exploit homogeneity',
    text: 'If the problem is scale-invariant, normalize a variable to 1 to simplify.',
  },
];

export default function MathCapsule() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * CAPSULES.length));

  // auto-rotate every 7s
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % CAPSULES.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const c = CAPSULES[idx];

  return (
    <div className="math-capsule">
      <p className="math-capsule-tag">problem-solving tactics</p>
      <h3>{c.title}</h3>
      <p>{c.text}</p>
      <div className="math-capsule-actions">
        <button onClick={() => setIdx((idx + 1) % CAPSULES.length)}>another →</button>
        <a href="/visual-problems" className="capsule-link">explore problems →</a>
      </div>
    </div>
  );
}
