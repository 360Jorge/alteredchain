import React, { useMemo, useState } from 'react';

// ---------- Core helpers ----------
const mod = (a, n) => ((a % n) + n) % n;

// Directions to check: right, down, diag-down-right, diag-up-right
const DIRECTIONS = [
  { dr: 0, dc: 1 },  // →
  { dr: 1, dc: 0 },  // ↓
  { dr: 1, dc: 1 },  // ↘
  { dr: -1, dc: 1 }, // ↗ (wraps through top/bottom)
];

/**
 * Return the board index for row r, col c (both 0..N-1)
 */
const idx = (r, c, N) => r * N + c;

/**
 * Given a board, board size N, and target K (in-a-row),
 * return { winner: 'X'|'O'|null, line: [indices] | null }.
 * We check every cell as a starting point in the four directions,
 * wrapping via modulo arithmetic (torus).
 */
function detectWinner(board, N = 3, K = 3) {
  const inBoundsCell = (r, c) => board[idx(mod(r, N), mod(c, N), N)];

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const startVal = board[idx(r, c, N)];
      if (!startVal) continue;

      for (const { dr, dc } of DIRECTIONS) {
        let ok = true;
        const lineIndices = [idx(r, c, N)];

        for (let step = 1; step < K; step++) {
          const rr = mod(r + dr * step, N);
          const cc = mod(c + dc * step, N);
          const v = board[idx(rr, cc, N)];
          if (v !== startVal) {
            ok = false;
            break;
          }
          lineIndices.push(idx(rr, cc, N));
        }

        if (ok) return { winner: startVal, line: lineIndices };
      }
    }
  }
  return { winner: null, line: null };
}

export default function TicTacTorus({
  N = 3,              // board size
  K = 3,              // in-a-row to win
  cellSize = 96,      // px (each square)
  fontSize = 48,      // px
}) {
  const [board, setBoard] = useState(Array(N * N).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Compute game status
  const { winner, line } = useMemo(() => detectWinner(board, N, K), [board, N, K]);
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (i) => {
    if (winner || board[i]) return;  // ignore if game finished or cell filled
    const next = board.slice();
    next[i] = xIsNext ? 'X' : 'O';
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setBoard(Array(N * N).fill(null));
    setXIsNext(true);
  };

  // Simple status label
  let status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Draw!'
    : `Turn: ${xIsNext ? 'X' : 'O'}`;

  // Inline styles (scoped, no external CSS required)
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${N}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${N}, ${cellSize}px)`,
    gap: '6px',
    justifyContent: 'start',
    alignItems: 'start',
    userSelect: 'none',
  };

  const cellStyle = (i) => ({
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fontSize}px`,
    fontWeight: 700,
    cursor: board[i] || winner ? 'default' : 'pointer',
    borderRadius: '10px',
    border: '2px solid #e5e7eb', // light gray
    transition: 'transform 80ms ease',
    background:
      line && line.includes(i)
        ? 'radial-gradient(circle at 30% 30%, #fff, #e0f2fe 70%)' // subtle highlight on winning line
        : '#ffffff',
  });

  const containerStyle = {
    display: 'inline-block',
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fafafa',
  };

  const statusStyle = {
    marginTop: '12px',
    marginBottom: '12px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    fontWeight: 600,
  };

  const hintStyle = {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '2px',
    marginBottom: '12px',
  };

  const btnRow = {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  };

  const btn = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  };

  return (
    <div style={containerStyle} aria-label="Tic-Tac-Torus Game">
      <div style={statusStyle}>{status}</div>
      <div style={hintStyle}>
        Torus rules: edges wrap—right↔left, top↔bottom. Three in a row can cross boundaries.
      </div>

      <div style={gridStyle} role="grid" aria-label={`${N} by ${N} torus board`}>
        {Array.from({ length: N * N }, (_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={cellStyle(i)}
            aria-label={`Cell ${Math.floor(i / N) + 1}, ${mod(i, N) + 1}`}
          >
            {board[i]}
          </button>
        ))}
      </div>

      <div style={btnRow}>
        <button style={btn} onClick={reset}>Reset</button>
      </div>

      <details style={{ marginTop: '12px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How the math works</summary>
        <div style={{ marginTop: '8px', color: '#374151', lineHeight: 1.5 }}>
          We index cells by (r, c) with r, c ∈ {`{0,1,2}`}, and check lines in four directions:
          →, ↓, ↘, and ↗. Each step uses modular arithmetic:
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '6px' }}>
            r ← (r + dr) mod 3,  c ← (c + dc) mod 3
          </pre>
          That turns the 3×3 grid into a torus: opposite edges are identified. A win is K=3 equal
          marks along any wrapped line.
        </div>
      </details>
    </div>
  );
}
