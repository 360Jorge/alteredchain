import React, { useEffect, useMemo, useRef, useState } from "react";

type PotentialName = "harmonic" | "doubleWell";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function linspace(a: number, b: number, n: number) {
  const arr = new Array(n);
  const step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) arr[i] = a + step * i;
  return arr;
}

function V(x: number, kind: PotentialName) {
  if (kind === "harmonic") {
    // V(x) = 1/2 k x^2
    const k = 1.0;
    return 0.5 * k * x * x;
  }
  // Double-well: V(x)=a(x^2-b^2)^2
  const a = 0.15;
  const b = 2.0;
  const u = x * x - b * b;
  return a * u * u;
}

/** Find approximate turning points where V(x)=E by scanning sign changes */
function findTurningPoints(xs: number[], Vs: number[], E: number) {
  const roots: number[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    const f0 = Vs[i] - E;
    const f1 = Vs[i + 1] - E;
    if (f0 === 0) roots.push(xs[i]);
    if (f0 * f1 < 0) {
      // linear interpolation
      const t = f0 / (f0 - f1);
      roots.push(xs[i] + t * (xs[i + 1] - xs[i]));
    }
  }
  // de-dupe close roots
  roots.sort((a, b) => a - b);
  const out: number[] = [];
  for (const r of roots) {
    if (out.length === 0 || Math.abs(r - out[out.length - 1]) > 1e-2) out.push(r);
  }
  return out;
}

export default function EnergyLandscape() {
  // --- display geometry ---
  const width = 720;
  const height = 420;
  const pad = 48;

  // --- model parameters ---
  const [kind, setKind] = useState<PotentialName>("harmonic");
  const [E, setE] = useState(2.0);
  const m = 1.0;

  // domain
  const xMin = -4;
  const xMax = 4;

  // sampling for plot + root finding
  const N = 700;
  const xs = useMemo(() => linspace(xMin, xMax, N), [xMin, xMax]);
  const Vs = useMemo(() => xs.map((x) => V(x, kind)), [xs, kind]);

  // y range with some padding
  const yMax = useMemo(() => {
    const vmax = Math.max(...Vs, E);
    return vmax * 1.08 + 0.15;
  }, [Vs, E]);

  // helpers to map (x,y) -> SVG coords
  const toX = (x: number) =>
    pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const toY = (y: number) =>
    pad + (1 - y / yMax) * (height - 2 * pad);

  // build potential path
  const potentialPath = useMemo(() => {
    let d = "";
    for (let i = 0; i < xs.length; i++) {
      const sx = toX(xs[i]);
      const sy = toY(Vs[i]);
      d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    return d;
  }, [xs, Vs, yMax]);

  // turning points
  const turningPoints = useMemo(() => findTurningPoints(xs, Vs, E), [xs, Vs, E]);

  // allowed region mask path: follow V where V<=E, then close to energy line
  const allowedFillPath = useMemo(() => {
    const allowed: { x: number; y: number }[] = [];
    for (let i = 0; i < xs.length; i++) {
      if (Vs[i] <= E) allowed.push({ x: xs[i], y: Vs[i] });
    }
    if (allowed.length < 2) return "";

    // split into contiguous segments if the allowed region is disconnected
    // We’ll just build a single path for the first segment for simplicity,
    // and the animation will also use the first allowed interval.
    const seg: { x: number; y: number }[] = [];
    seg.push(allowed[0]);
    for (let i = 1; i < allowed.length; i++) {
      const dx = allowed[i].x - allowed[i - 1].x;
      if (dx > (xMax - xMin) / N * 2.5) break; // gap -> stop at first segment
      seg.push(allowed[i]);
    }

    const xL = seg[0].x;
    const xR = seg[seg.length - 1].x;

    let d = `M ${toX(xL)} ${toY(E)}`;
    // go down to curve at left
    d += ` L ${toX(xL)} ${toY(seg[0].y)}`;
    // follow curve
    for (let i = 1; i < seg.length; i++) d += ` L ${toX(seg[i].x)} ${toY(seg[i].y)}`;
    // go up to energy line
    d += ` L ${toX(xR)} ${toY(E)}`;
    // close along energy line back to left
    d += ` Z`;
    return d;
  }, [xs, Vs, E, yMax]);

  // pick an interval to animate in: use first turning-point pair if available
  const [xL, xR] = useMemo(() => {
    if (turningPoints.length >= 2) return [turningPoints[0], turningPoints[1]];
    // fallback: where Vs <= E, find first contiguous interval
    let left = xMin, right = xMax;
    let found = false;
    for (let i = 0; i < xs.length; i++) {
      if (!found && Vs[i] <= E) {
        left = xs[i];
        found = true;
      }
      if (found && Vs[i] > E) {
        right = xs[i];
        break;
      }
    }
    return [left, right];
  }, [turningPoints, xs, Vs, E]);

  // animation state
  const xRef = useRef(0);
  const dirRef = useRef(1); // +1 right, -1 left
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);
  const [xBall, setXBall] = useState(0);

  // reset ball when potential/E changes
  useEffect(() => {
    const start = clamp(0, xL, xR);
    xRef.current = start;
    dirRef.current = 1;
    setXBall(start);
  }, [kind, E, xL, xR]);

  useEffect(() => {
    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dt = Math.min(0.03, (t - lastTRef.current) / 1000);
      lastTRef.current = t;

      // energy-based speed
      const x = xRef.current;
      const v2 = Math.max(0, (2 / m) * (E - V(x, kind)));
      const v = Math.sqrt(v2);

      // scale factor to make it visually pleasant
      const speedScale = 0.9;
      let xNext = x + dirRef.current * v * speedScale * dt;

      // bounce at turning points
      if (xNext > xR) {
        xNext = xR - (xNext - xR);
        dirRef.current *= -1;
      } else if (xNext < xL) {
        xNext = xL + (xL - xNext);
        dirRef.current *= -1;
      }

      xRef.current = xNext;
      setXBall(xNext);
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [E, kind, xL, xR]);

  const yBall = V(xBall, kind);

  return (
    <div style={{ margin: "1.25rem 0" }}>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Potential</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as PotentialName)}
            style={{ padding: "6px 10px", borderRadius: 10 }}
          >
            <option value="harmonic">Harmonic (½x²)</option>
            <option value="doubleWell">Double well</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            Energy E = {E.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.1}
            max={Math.max(0.6, Math.min(8, yMax - 0.2))}
            step={0.01}
            value={E}
            onChange={(e) => setE(parseFloat(e.target.value))}
            style={{ width: 220 }}
          />
        </label>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Turning points:{" "}
          {turningPoints.length >= 2
            ? `${turningPoints[0].toFixed(2)}, ${turningPoints[1].toFixed(2)}`
            : "none (E below minimum or outside domain)"}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Energy landscape with potential, energy line, allowed region, and particle"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.35)",
          background: "rgba(2,6,23,0.02)",
        }}
      >
        {/* axes */}
        <line x1={pad} y1={toY(0)} x2={width - pad} y2={toY(0)} stroke="rgba(15,23,42,0.35)" />
        <line x1={toX(0)} y1={pad} x2={toX(0)} y2={height - pad} stroke="rgba(15,23,42,0.25)" />

        {/* allowed region fill */}
        {allowedFillPath && (
          <path d={allowedFillPath} fill="rgba(34,197,94,0.12)" stroke="none" />
        )}

        {/* potential curve */}
        <path d={potentialPath} fill="none" stroke="rgba(37,99,235,0.95)" strokeWidth={2.5} />

        {/* energy line */}
        <line
          x1={pad}
          y1={toY(E)}
          x2={width - pad}
          y2={toY(E)}
          stroke="rgba(244,63,94,0.9)"
          strokeWidth={2}
          strokeDasharray="6 6"
        />

        {/* turning points markers */}
        {turningPoints.slice(0, 2).map((xp, i) => (
          <g key={i}>
            <line
              x1={toX(xp)}
              y1={toY(E) - 10}
              x2={toX(xp)}
              y2={toY(E) + 10}
              stroke="rgba(244,63,94,0.75)"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* particle */}
        {E - yBall >= 0 && (
          <g>
            <circle cx={toX(xBall)} cy={toY(yBall)} r={8} fill="rgba(245,158,11,0.95)" />
            <circle cx={toX(xBall)} cy={toY(yBall)} r={14} fill="rgba(245,158,11,0.15)" />
          </g>
        )}

        {/* labels */}
        <text x={pad} y={pad - 14} fontSize="12" fill="rgba(15,23,42,0.8)">
          V(x) and energy E
        </text>
        <text x={width - pad - 60} y={toY(E) - 10} fontSize="12" fill="rgba(244,63,94,0.85)">
          E
        </text>
      </svg>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        The particle moves only where E ≥ V(x). Turning points occur where E = V(x).
    </p>


    </div>
  );
}
