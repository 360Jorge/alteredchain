import React, { useEffect, useMemo, useRef, useState } from "react";

type Pt = { q: number; p: number };

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

// Polygon area (shoelace) for points ordered around boundary
function polygonArea(pts: Pt[]) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    s += pts[i].q * pts[j].p - pts[j].q * pts[i].p;
  }
  return Math.abs(s) / 2;
}

// RK2 / midpoint integrator
function rk2Step(y: Pt, dt: number, f: (y: Pt) => Pt): Pt {
  const k1 = f(y);
  const mid = { q: y.q + (dt / 2) * k1.q, p: y.p + (dt / 2) * k1.p };
  const k2 = f(mid);
  return { q: y.q + dt * k2.q, p: y.p + dt * k2.p };
}

function makeCircleBlob(center: Pt, r: number, n: number) {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push({ q: center.q + r * Math.cos(t), p: center.p + r * Math.sin(t) });
  }
  return pts;
}

export default function LiouvilleBlob() {
  const width = 720;
  const height = 420;
  const pad = 48;

  // phase space limits
  const qMax = 3.2;
  const pMax = 3.2;

  const toX = (q: number) => pad + ((q + qMax) / (2 * qMax)) * (width - 2 * pad);
  const toY = (p: number) => pad + (1 - (p + pMax) / (2 * pMax)) * (height - 2 * pad);

  // UI
  const [speed, setSpeed] = useState(1.2);
  const [blobR, setBlobR] = useState(0.45);
  const [centerQ, setCenterQ] = useState(1.2);
  const [centerP, setCenterP] = useState(0.0);
  const [paused, setPaused] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);

  // Hamiltonian choice: H = p^2/2 + q^4/4
  // qdot = ∂H/∂p = p
  // pdot = -∂H/∂q = -q^3
  const flow = (y: Pt): Pt => {
    const qdot = y.p;
    const pdot = -Math.pow(y.q, 3);
    return { q: qdot, p: pdot };
  };

  const H = (pt: Pt) => (pt.p * pt.p) / 2 + Math.pow(pt.q, 4) / 4;

  // blob boundary points (ordered)
  const nBoundary = 90;

  const initialBlob = useMemo(() => {
    const c = { q: clamp(centerQ, -qMax * 0.7, qMax * 0.7), p: clamp(centerP, -pMax * 0.7, pMax * 0.7) };
    return makeCircleBlob(c, blobR, nBoundary);
  }, [centerQ, centerP, blobR]);

  const [blob, setBlob] = useState<Pt[]>(initialBlob);
  const blobRef = useRef<Pt[]>(initialBlob);
  const [areaHistory, setAreaHistory] = useState<number[]>([]);

  useEffect(() => {
    setBlob(initialBlob);
    blobRef.current = initialBlob;
    setAreaHistory([]);
  }, [initialBlob]);

  // area readout: compare to initial area
  const A0 = useMemo(() => polygonArea(initialBlob), [initialBlob]);
  const A = useMemo(() => polygonArea(blob), [blob]);

  // Track area over time for history
  useEffect(() => {
    setAreaHistory(prev => {
      const next = [...prev, A];
      return next.slice(-200); // Keep last 200 measurements
    });
  }, [A]);

  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);

  useEffect(() => {
    if (paused) return;

    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dtRaw = (t - lastTRef.current) / 1000;
      lastTRef.current = t;

      const dt = Math.min(0.025, dtRaw) * speed;

      const current = blobRef.current;

      // Evolve each boundary point
      const next = current.map((pt) => {
        const out = rk2Step(pt, dt, flow);

        // keep in frame with gentle clamp
        return {
          q: clamp(out.q, -qMax, qMax),
          p: clamp(out.p, -pMax, pMax),
        };
      });

      blobRef.current = next;
      setBlob(next);

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [speed, paused]);

  const reset = () => {
    setBlob(initialBlob);
    blobRef.current = initialBlob;
    setAreaHistory([]);
  };

  // SVG path for blob boundary
  const blobPath = useMemo(() => {
    if (blob.length < 2) return "";
    let d = `M ${toX(blob[0].q)} ${toY(blob[0].p)}`;
    for (let i = 1; i < blob.length; i++) d += ` L ${toX(blob[i].q)} ${toY(blob[i].p)}`;
    d += " Z";
    return d;
  }, [blob]);

  const initialBlobPath = useMemo(() => {
    if (initialBlob.length < 2) return "";
    let d = `M ${toX(initialBlob[0].q)} ${toY(initialBlob[0].p)}`;
    for (let i = 1; i < initialBlob.length; i++) d += ` L ${toX(initialBlob[i].q)} ${toY(initialBlob[i].p)}`;
    d += " Z";
    return d;
  }, [initialBlob]);

  // Compute energy contours for reference
  const energyLevels = useMemo(() => {
    if (!showEnergy) return [];
    return [0.5, 1.0, 2.0, 3.5, 5.0];
  }, [showEnergy]);

  const energyPaths = useMemo(() => {
    return energyLevels.map(E => {
      // For H = p²/2 + q⁴/4 = E, solve for p(q)
      const points: Pt[] = [];
      const nPts = 200;
      const qRange = Math.pow(4 * E, 0.25); // max q where p=0
      
      for (let i = 0; i <= nPts; i++) {
        const q = -qRange + (i / nPts) * 2 * qRange;
        const pSquared = 2 * (E - Math.pow(q, 4) / 4);
        if (pSquared >= 0) {
          const p = Math.sqrt(pSquared);
          points.push({ q, p });
        }
      }
      
      // Add lower half (negative p)
      for (let i = nPts; i >= 0; i--) {
        const q = -qRange + (i / nPts) * 2 * qRange;
        const pSquared = 2 * (E - Math.pow(q, 4) / 4);
        if (pSquared >= 0) {
          const p = -Math.sqrt(pSquared);
          points.push({ q, p });
        }
      }
      
      if (points.length < 3) return { E, d: "" };
      
      let d = `M ${toX(points[0].q)} ${toY(points[0].p)}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${toX(points[i].q)} ${toY(points[i].p)}`;
      }
      d += " Z";
      
      return { E, d };
    });
  }, [energyLevels]);

  // Color based on area conservation
  const areaRatio = A / A0;
  const conservationQuality = Math.abs(1 - areaRatio);
  const blobColor = conservationQuality < 0.05 
    ? "rgba(34,197,94,0.55)"  // green if good
    : conservationQuality < 0.1
    ? "rgba(234,179,8,0.65)"  // yellow if okay
    : "rgba(239,68,68,0.65)"; // red if drifting

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
        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>speed = {speed.toFixed(2)}</span>
          <input
            type="range"
            min={0.2}
            max={6.0}
            step={0.01}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: 140 }}
          />
        </label>

        <button
          onClick={() => setPaused(!paused)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid rgba(148,163,184,0.4)",
            background: "white",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit"
          }}
        >
          {paused ? "▶ Play" : "⏸ Pause"}
        </button>

        <button
          onClick={reset}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid rgba(148,163,184,0.4)",
            background: "white",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit"
          }}
        >
           Reset
        </button>

        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={showInitial}
            onChange={(e) => setShowInitial(e.target.checked)}
          />
          <span style={{ fontSize: 13, opacity: 0.85 }}>Show initial</span>
        </label>

        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={showEnergy}
            onChange={(e) => setShowEnergy(e.target.checked)}
          />
          <span style={{ fontSize: 13, opacity: 0.85 }}>Energy contours</span>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>radius</span>
          <input
            type="range"
            min={0.15}
            max={0.75}
            step={0.01}
            value={blobR}
            onChange={(e) => setBlobR(parseFloat(e.target.value))}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{blobR.toFixed(2)}</span>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>q₀</span>
          <input
            type="range"
            min={-2.0}
            max={2.0}
            step={0.01}
            value={centerQ}
            onChange={(e) => setCenterQ(parseFloat(e.target.value))}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{centerQ.toFixed(2)}</span>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>p₀</span>
          <input
            type="range"
            min={-2.0}
            max={2.0}
            step={0.01}
            value={centerP}
            onChange={(e) => setCenterP(parseFloat(e.target.value))}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{centerP.toFixed(2)}</span>
        </label>

        <div style={{ 
          fontSize: 12, 
          opacity: 0.85,
          padding: "4px 8px",
          background: conservationQuality < 0.05 ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
          borderRadius: 4
        }}>
          A = {A.toFixed(4)} • A₀ = {A0.toFixed(4)} • ratio = {areaRatio.toFixed(4)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="application"
        aria-label="Liouville blob: area-preserving Hamiltonian flow"
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
          strokeWidth="1.5"
        />
        <line 
          x1={toX(0)} 
          y1={pad} 
          x2={toX(0)} 
          y2={height - pad} 
          stroke="rgba(15,23,42,0.35)" 
          strokeWidth="1.5"
        />

        {/* labels */}
        <text 
          x={width - pad - 10} 
          y={toY(0) - 10} 
          fontSize="13" 
          fill="rgba(15,23,42,0.8)" 
          textAnchor="end"
          fontWeight="500"
        >
          q (position)
        </text>
        <text 
          x={toX(0) + 12} 
          y={pad + 16} 
          fontSize="13" 
          fill="rgba(15,23,42,0.8)"
          fontWeight="500"
        >
          p (momentum)
        </text>

        {/* energy contours */}
        {showEnergy && energyPaths.map(({ E, d }) => d && (
          <path
            key={E}
            d={d}
            fill="none"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* initial blob outline */}
        {showInitial && (
          <path 
            d={initialBlobPath} 
            fill="none" 
            stroke="rgba(100,116,139,0.4)" 
            strokeWidth={2}
            strokeDasharray="6 3"
          />
        )}

        {/* current blob */}
        <path 
          d={blobPath} 
          fill="rgba(34,197,94,0.14)" 
          stroke={blobColor}
          strokeWidth={2.5}
        />

        {/* boundary points (showing the mesh) */}
        {blob.map((pt, i) => (
          <circle
            key={i}
            cx={toX(pt.q)}
            cy={toY(pt.p)}
            r={2}
            fill="rgba(34,197,94,0.6)"
          />
        ))}

        {/* centroid marker */}
        {blob.length > 0 && (
          <g>
            <circle
              cx={toX(blob.reduce((s, x) => s + x.q, 0) / blob.length)}
              cy={toY(blob.reduce((s, x) => s + x.p, 0) / blob.length)}
              r={4.5}
              fill="rgba(15,23,42,0.75)"
            />
            <circle
              cx={toX(blob.reduce((s, x) => s + x.q, 0) / blob.length)}
              cy={toY(blob.reduce((s, x) => s + x.p, 0) / blob.length)}
              r={8}
              fill="rgba(15,23,42,0.1)"
              stroke="rgba(15,23,42,0.3)"
              strokeWidth={1}
            />
          </g>
        )}

        {/* title */}
        <text x={pad} y={pad - 16} fontSize="12" fill="rgba(15,23,42,0.8)" fontWeight="500">
          Liouville's Theorem: Phase Space Volume Conservation
        </text>
      </svg>

      <p style={{ marginTop: "0.75rem", fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
        Watch as the blob stretches, shears, and rotates—but its area remains constant. This is <strong>Liouville's theorem</strong>: 
        Hamiltonian flow preserves phase space volume. The color indicates conservation quality (green = excellent, yellow = good, red = numerical drift). 
        Any deviation from ratio=1.0 is due to numerical integration error, not physics.
      </p>
    </div>
  );
}