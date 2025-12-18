import React, { useEffect, useMemo, useRef, useState } from "react";

type Mode = "full" | "qdot" | "pdot";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function linspace(a: number, b: number, n: number) {
  const arr = new Array(n);
  const step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) arr[i] = a + step * i;
  return arr;
}

function norm(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

export default function HamiltonianFlowField() {
  // --- SVG geometry ---
  const width = 720;
  const height = 420;
  const pad = 48;

  // --- physical parameters ---
  const [m, setM] = useState(1.0);
  const [k, setK] = useState(1.0);
  const omega = Math.sqrt(k / m);

  // --- UI ---
  const [mode, setMode] = useState<Mode>("full");
  const [speed, setSpeed] = useState(1.0);

  // plotting ranges
  const qMax = 3.2;
  const pMax = 3.2;

  const toX = (q: number) =>
    pad + ((q + qMax) / (2 * qMax)) * (width - 2 * pad);
  const toY = (p: number) =>
    pad + (1 - (p + pMax) / (2 * pMax)) * (height - 2 * pad);

  // Hamiltonian vector field for harmonic oscillator:
  // qdot = p/m ; pdot = -k q
  const field = (q: number, p: number) => {
    const qdot = p / m;
    const pdot = -k * q;

    if (mode === "qdot") return { u: qdot, v: 0 };
    if (mode === "pdot") return { u: 0, v: pdot };
    return { u: qdot, v: pdot };
  };

  // arrow grid points
  const grid = useMemo(() => {
    const nQ = 15;
    const nP = 9;
    const qs = linspace(-qMax, qMax, nQ);
    const ps = linspace(-pMax, pMax, nP);
    const pts: { q: number; p: number; u: number; v: number }[] = [];
    for (const q of qs) {
      for (const p of ps) {
        const { u, v } = field(q, p);
        pts.push({ q, p, u, v });
      }
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, k, mode]);

  // scale arrow lengths so they look good
  const arrowScale = useMemo(() => {
    let maxMag = 1e-6;
    for (const g of grid) maxMag = Math.max(maxMag, norm(g.u, g.v));
    const targetPx = 24;
    return targetPx / maxMag;
  }, [grid]);

  // optional: energy ellipses as context
  const energyLevels = useMemo(() => [0.8, 1.6, 2.6, 3.8], []);
  const ellipsePaths = useMemo(() => {
    // H = p^2/(2m) + k q^2/2 = E
    // q = sqrt(2E/k) cos t; p = sqrt(2mE) sin t
    const paths = energyLevels.map((E) => {
      const qA = Math.sqrt((2 * E) / k);
      const pA = Math.sqrt(2 * m * E);
      const steps = 260;
      let d = "";
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const q = qA * Math.cos(t);
        const p = pA * Math.sin(t);
        const sx = toX(q);
        const sy = toY(p);
        d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
      }
      return { E, d };
    });
    return paths;
  }, [energyLevels, m, k]);

  // --- particle simulation (RK2 / midpoint) ---
  // Start with nonzero momentum so it visibly moves immediately.
  const [state, setState] = useState({ q: 1.2, p: 1.2 });
  const stateRef = useRef(state);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // reset particle when parameters change (keeps it inside view)
  useEffect(() => {
    const q0 = clamp(1.2, -qMax * 0.9, qMax * 0.9);
    const p0 = clamp(1.2, -pMax * 0.9, pMax * 0.9);
    setState({ q: q0, p: p0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, k, mode]);

  useEffect(() => {
    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dtRaw = (t - lastTRef.current) / 1000;
      lastTRef.current = t;

      // Keep dt stable; apply "speed" as a multiplier to the vector field.
      const dt = Math.min(0.05, dtRaw);

      const { q, p } = stateRef.current;

      // midpoint method: y_{n+1} = y_n + dt * f(y_n + (dt/2) f(y_n))
      const f1 = field(q, p);
      const qMid = q + (dt / 2) * (speed * f1.u);
      const pMid = p + (dt / 2) * (speed * f1.v);

      const f2 = field(qMid, pMid);

      let qNext = q + dt * (speed * f2.u);
      let pNext = p + dt * (speed * f2.v);

      // keep particle in frame: reflect off walls softly
      if (qNext > qMax) qNext = qMax - (qNext - qMax);
      if (qNext < -qMax) qNext = -qMax + (-qMax - qNext);
      if (pNext > pMax) pNext = pMax - (pNext - pMax);
      if (pNext < -pMax) pNext = -pMax + (-pMax - pNext);

      const next = { q: qNext, p: pNext };
      stateRef.current = next;
      setState(next);

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [speed, mode, m, k]); // field depends on mode/m/k through closure

  // energy readout (for full field only it stays constant; for partial modes it won't)
  const H = (state.p * state.p) / (2 * m) + (k * state.q * state.q) / 2;

  // arrow drawing helper: line + little head
  const arrow = (x: number, y: number, dx: number, dy: number) => {
    const L = Math.sqrt(dx * dx + dy * dy);
    if (L < 1e-6) return null;

    const ux = dx / L;
    const uy = dy / L;

    const head = 6; // px
    const hx = x + dx;
    const hy = y + dy;

    const leftX = hx - head * (ux * 0.8 - uy * 0.6);
    const leftY = hy - head * (uy * 0.8 + ux * 0.6);
    const rightX = hx - head * (ux * 0.8 + uy * 0.6);
    const rightY = hy - head * (uy * 0.8 - ux * 0.6);

    return (
      <g>
        <line
          x1={x}
          y1={y}
          x2={hx}
          y2={hy}
          stroke="rgba(37,99,235,0.70)"
          strokeWidth={1.6}
        />
        <polygon
          points={`${hx},${hy} ${leftX},${leftY} ${rightX},${rightY}`}
          fill="rgba(37,99,235,0.70)"
        />
      </g>
    );
  };

  return (
    <div style={{ margin: "1.25rem 0" }}>
      <div
        style={{
          display: "flex",
          gap: "0.9rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <label style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            style={{ padding: "6px 10px", borderRadius: 10 }}
          >
            <option value="full">Full field</option>
            <option value="qdot">Only q̇ component</option>
            <option value="pdot">Only ṗ component</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            speed = {speed.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.2}
            max={8}
            step={0.01}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: 180 }}
          />
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>m</span>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.01}
            value={m}
            onChange={(e) => setM(parseFloat(e.target.value))}
            style={{ width: 140 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{m.toFixed(2)}</span>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>k</span>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.01}
            value={k}
            onChange={(e) => setK(parseFloat(e.target.value))}
            style={{ width: 140 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{k.toFixed(2)}</span>
        </label>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          q = {state.q.toFixed(3)} • p = {state.p.toFixed(3)} • H ≈{" "}
          {H.toFixed(3)} • ω ≈ {omega.toFixed(3)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Hamiltonian vector field in phase space"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.35)",
          background: "rgba(2,6,23,0.02)",
        }}
      >
        {/* axes */}
        <line
          x1={pad}
          y1={toY(0)}
          x2={width - pad}
          y2={toY(0)}
          stroke="rgba(15,23,42,0.35)"
        />
        <line
          x1={toX(0)}
          y1={pad}
          x2={toX(0)}
          y2={height - pad}
          stroke="rgba(15,23,42,0.25)"
        />

        {/* labels */}
        <text
          x={width - pad - 10}
          y={toY(0) - 8}
          fontSize="12"
          fill="rgba(15,23,42,0.75)"
          textAnchor="end"
        >
          q
        </text>
        <text
          x={toX(0) + 10}
          y={pad + 14}
          fontSize="12"
          fill="rgba(15,23,42,0.75)"
        >
          p
        </text>

        {/* energy ellipses (context) */}
        {ellipsePaths.map((obj) => (
          <path
            key={obj.E}
            d={obj.d}
            fill="none"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth={1.4}
            strokeDasharray="6 8"
          />
        ))}

        {/* vector field arrows */}
        {grid.map((g, idx) => {
          const sx = toX(g.q);
          const sy = toY(g.p);

          const dx = g.u * arrowScale;
          const dy = -g.v * arrowScale; // SVG y is down, phase p is up

          return (
            <g key={idx} opacity={0.95}>
              {arrow(sx, sy, dx, dy)}
            </g>
          );
        })}

        {/* moving particle */}
        <g>
          <circle
            cx={toX(state.q)}
            cy={toY(state.p)}
            r={8}
            fill="rgba(245,158,11,0.95)"
          />
          <circle
            cx={toX(state.q)}
            cy={toY(state.p)}
            r={14}
            fill="rgba(245,158,11,0.15)"
          />
        </g>
      </svg>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        The arrows show q̇ and ṗ in phase space. For the harmonic oscillator, the
        flow rotates around the origin.
      </p>
    </div>
  );
}
