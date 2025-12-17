import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function HarmonicPhasePortrait() {
  // --- SVG geometry ---
  const width = 720;
  const height = 420;
  const pad = 48;

  // --- physical params (dimensionless-friendly) ---
  // H = p^2/(2m) + (k q^2)/2
  const m = 1.0;
  const k = 1.0;
  const omega = Math.sqrt(k / m);

  // --- UI state ---
  const [E, setE] = useState(1.5); // selected energy for animated orbit

  // set plot limits based on max energy we expect
  const Emax = 4.0;

  // For a given E:
  // q_max = sqrt(2E/k)
  // p_max = sqrt(2mE)
  const qMax = Math.sqrt((2 * Emax) / k);
  const pMax = Math.sqrt(2 * m * Emax);

  const toX = (q: number) =>
    pad + ((q + qMax) / (2 * qMax)) * (width - 2 * pad);
  const toY = (p: number) =>
    pad + (1 - (p + pMax) / (2 * pMax)) * (height - 2 * pad);

  // energies to draw as nested ellipses
  const energyLevels = useMemo(() => [0.5, 1.0, 1.5, 2.25, 3.0, 4.0], []);

  // build ellipse paths for each energy
  const ellipsePaths = useMemo(() => {
    // Param: q = qmax cosθ, p = pmax sinθ
    const paths = energyLevels.map((Ei) => {
      const qA = Math.sqrt((2 * Ei) / k);
      const pA = Math.sqrt(2 * m * Ei);
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
      return { E: Ei, d };
    });
    return paths;
  }, [energyLevels, qMax, pMax]);

  // --- animation ---
  const thetaRef = useRef(0);
  const lastTRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const [qp, setQp] = useState({ q: 0, p: Math.sqrt(2 * m * E) });

  useEffect(() => {
    // reset to a consistent phase when E changes
    thetaRef.current = 0;
    setQp({ q: Math.sqrt((2 * E) / k), p: 0 });
  }, [E, k]);

  useEffect(() => {
    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dt = Math.min(0.03, (t - lastTRef.current) / 1000);
      lastTRef.current = t;

      // Angular speed is omega in phase parameter
      thetaRef.current += omega * dt;

      const qA = Math.sqrt((2 * E) / k);
      const pA = Math.sqrt(2 * m * E);

      const th = thetaRef.current;
      const q = qA * Math.cos(th);
      const p = pA * Math.sin(th);

      setQp({ q, p });

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [E, k, m, omega]);

  const H = (qp.p * qp.p) / (2 * m) + (k * qp.q * qp.q) / 2;

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
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            Energy E = {E.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.2}
            max={Emax}
            step={0.01}
            value={E}
            onChange={(e) => setE(parseFloat(e.target.value))}
            style={{ width: 220 }}
          />
        </label>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          q(t) = {qp.q.toFixed(3)} &nbsp;•&nbsp; p(t) = {qp.p.toFixed(3)}
          &nbsp;•&nbsp; H ≈ {H.toFixed(3)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Harmonic oscillator phase portrait"
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
        <text x={width - pad - 10} y={toY(0) - 8} fontSize="12" fill="rgba(15,23,42,0.75)" textAnchor="end">
          q
        </text>
        <text x={toX(0) + 10} y={pad + 14} fontSize="12" fill="rgba(15,23,42,0.75)">
          p
        </text>

        {/* nested ellipses */}
        {ellipsePaths.map((obj) => {
          const isSelected = Math.abs(obj.E - E) < 1e-6;
          return (
            <path
              key={obj.E}
              d={obj.d}
              fill="none"
              stroke={isSelected ? "rgba(244,63,94,0.8)" : "rgba(37,99,235,0.55)"}
              strokeWidth={isSelected ? 2.6 : 2.0}
              strokeDasharray={isSelected ? "0" : "6 6"}
            />
          );
        })}

        {/* moving point */}
        <g>
          <circle cx={toX(qp.q)} cy={toY(qp.p)} r={8} fill="rgba(245,158,11,0.95)" />
          <circle cx={toX(qp.q)} cy={toY(qp.p)} r={14} fill="rgba(245,158,11,0.15)" />
        </g>
      </svg>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        Closed curves in (q, p) correspond to constant energy. Higher E gives a larger ellipse.
      </p>
    </div>
  );
}
