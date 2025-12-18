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

  // Hamiltonian choice: H = p^2/2 + q^4/4
  // qdot = ∂H/∂p = p
  // pdot = -∂H/∂q = -q^3
  const flow = (y: Pt): Pt => {
    const qdot = y.p;
    const pdot = -Math.pow(y.q, 3);
    return { q: qdot, p: pdot };
  };

  // blob boundary points (ordered)
  const nBoundary = 90;

  const initialBlob = useMemo(() => {
    const c = { q: clamp(centerQ, -qMax * 0.7, qMax * 0.7), p: clamp(centerP, -pMax * 0.7, pMax * 0.7) };
    return makeCircleBlob(c, blobR, nBoundary);
  }, [centerQ, centerP, blobR]);

  const [blob, setBlob] = useState<Pt[]>(initialBlob);
  const blobRef = useRef<Pt[]>(initialBlob);

  useEffect(() => {
    setBlob(initialBlob);
    blobRef.current = initialBlob;
  }, [initialBlob]);

  // area readout: compare to initial area
  const A0 = useMemo(() => polygonArea(initialBlob), [initialBlob]);
  const A = useMemo(() => polygonArea(blob), [blob]);

  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);

  useEffect(() => {
    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dtRaw = (t - lastTRef.current) / 1000;
      lastTRef.current = t;

      const dt = Math.min(0.025, dtRaw) * speed;

      const current = blobRef.current;

      // Evolve each boundary point
      const next = current.map((pt) => {
        const out = rk2Step(pt, dt, flow);

        // keep in frame with gentle clamp (not physically perfect but avoids disappearing)
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
  }, [speed]);

  const reset = () => {
    setBlob(initialBlob);
    blobRef.current = initialBlob;
  };

  // SVG path for blob boundary
  const blobPath = useMemo(() => {
    if (blob.length < 2) return "";
    let d = `M ${toX(blob[0].q)} ${toY(blob[0].p)}`;
    for (let i = 1; i < blob.length; i++) d += ` L ${toX(blob[i].q)} ${toY(blob[i].p)}`;
    d += " Z";
    return d;
  }, [blob, qMax, pMax]);

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
            style={{ width: 180 }}
          />
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>blob radius</span>
          <input
            type="range"
            min={0.15}
            max={0.75}
            step={0.01}
            value={blobR}
            onChange={(e) => setBlobR(parseFloat(e.target.value))}
            style={{ width: 160 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{blobR.toFixed(2)}</span>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>center q</span>
          <input
            type="range"
            min={-2.0}
            max={2.0}
            step={0.01}
            value={centerQ}
            onChange={(e) => setCenterQ(parseFloat(e.target.value))}
            style={{ width: 140 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{centerQ.toFixed(2)}</span>
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>center p</span>
          <input
            type="range"
            min={-2.0}
            max={2.0}
            step={0.01}
            value={centerP}
            onChange={(e) => setCenterP(parseFloat(e.target.value))}
            style={{ width: 140 }}
          />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{centerP.toFixed(2)}</span>
        </label>

        <button
          onClick={reset}
          style={{
            padding: "7px 12px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.45)",
            background: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Reset
        </button>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Area ≈ {A.toFixed(3)} (initial {A0.toFixed(3)}) • ratio ≈ {(A / A0).toFixed(3)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
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
        <line x1={pad} y1={toY(0)} x2={width - pad} y2={toY(0)} stroke="rgba(15,23,42,0.35)" />
        <line x1={toX(0)} y1={pad} x2={toX(0)} y2={height - pad} stroke="rgba(15,23,42,0.25)" />

        {/* labels */}
        <text x={width - pad - 10} y={toY(0) - 8} fontSize="12" fill="rgba(15,23,42,0.75)" textAnchor="end">
          q
        </text>
        <text x={toX(0) + 10} y={pad + 14} fontSize="12" fill="rgba(15,23,42,0.75)">
          p
        </text>

        {/* blob */}
        <path d={blobPath} fill="rgba(34,197,94,0.14)" stroke="rgba(34,197,94,0.55)" strokeWidth={2} />

        {/* centroid marker */}
        {blob.length > 0 && (
          <g>
            <circle
              cx={toX(blob.reduce((s, x) => s + x.q, 0) / blob.length)}
              cy={toY(blob.reduce((s, x) => s + x.p, 0) / blob.length)}
              r={3.5}
              fill="rgba(15,23,42,0.55)"
            />
          </g>
        )}

        {/* annotation */}
        <text x={pad} y={pad - 12} fontSize="12" fill="rgba(15,23,42,0.8)">
          Hamiltonian flow stretches & shears — but preserves area (Liouville)
        </text>
      </svg>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        The blob distorts under the flow, but its area stays (approximately) constant. Any drift is numerical error.
      </p>
    </div>
  );
}
