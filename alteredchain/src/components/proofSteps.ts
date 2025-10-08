export type Kind = 'assumption' | 'implication' | 'contradiction' | 'neutral';

export interface ProofStep {
  kind: Kind;
  text: string;
  support: string;
}

export const proofSteps: ProofStep[] = [
  {
    kind: 'assumption',
    text: 'Assume $\\sqrt{2} = \\frac{a}{b}$ with integers $a, b$ in lowest terms.',
    support: 'This sets up our proof by contradiction. We’re assuming $\\sqrt{2}$ is rational.',
  },
  {
    kind: 'implication',
    text: 'Squaring gives $2 = \\frac{a^2}{b^2} \\Rightarrow a^2 = 2b^2$',
    support: 'We square both sides to eliminate the radical.',
  },
  {
    kind: 'implication',
    text: 'So $a^2$ is even, hence $a$ is even $\\Rightarrow a = 2k$',
    support: 'Only even numbers square to even numbers. Thus, $a$ must be even.',
  },
  {
    kind: 'implication',
    text: 'Then $a^2 = 4k^2 = 2b^2 \\Rightarrow b^2 = 2k^2 \\Rightarrow b$ is even.',
    support: 'Rewriting and simplifying shows $b$ must also be even.',
  },
  {
    kind: 'contradiction',
    text: 'But both $a$ and $b$ are even — contradicting the lowest terms assumption!',
    support: 'A contradiction! $a$ and $b$ share a factor, breaking our assumption.',
  },
  {
    kind: 'neutral',
    text: '$\\therefore \\sqrt{2}$ is irrational.',
    support: 'Q.E.D. 💥',
  },
];
