import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function HarmonicPhasePortrait() {
  // --- SVG geometry ---
  const width = 720;
  const height = 420;
  const pad = 60;

  // --- physical params (dimensionless-friendly) ---
  // H = p^2/(2m) + (k q^2)/2
  const m = 1.0;
  const k = 1.0;
  const omega = Math.sqrt(k / m);

  // --- UI state ---
  const [E, setE] = useState(1.5); // selected energy for animated orbit
  const [paused, setPaused] = useState(false);
  const [trail, setTrail] = useState<{q: number, p: number}[]>([]);

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
      return { E: Ei, d, qA, pA };
    });
    return paths;
  }, [energyLevels, qMax, pMax, k, m]);

  // --- animation ---
  const thetaRef = useRef(0);
  const lastTRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const [qp, setQp] = useState({ q: 0, p: Math.sqrt(2 * m * E) });

  useEffect(() => {
    // reset to a consistent phase when E changes
    thetaRef.current = 0;
    setQp({ q: Math.sqrt((2 * E) / k), p: 0 });
    setTrail([]);
  }, [E, k]);

  useEffect(() => {
    if (paused) return;
    
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
      
      // Add to trail
      setTrail(prev => {
        const newTrail = [...prev, { q, p }];
        return newTrail.slice(-50); // Keep last 50 points
      });

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [E, k, m, omega, paused]);

  const H = (qp.p * qp.p) / (2 * m) + (k * qp.q * qp.q) / 2;
  const period = (2 * Math.PI) / omega;

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

        <button
          onClick={() => setPaused(!paused)}
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: 12,
            borderRadius: 6,
            border: "1px solid rgba(148,163,184,0.4)",
            background: "white",
            cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          {paused ? "▶ Play" : "⏸ Pause"}
        </button>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          q = {qp.q.toFixed(3)} &nbsp;•&nbsp; p = {qp.p.toFixed(3)}
          &nbsp;•&nbsp; H ≈ {H.toFixed(3)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="application"
        aria-label="Interactive harmonic oscillator phase portrait"
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

        {/* axis ticks */}
        {[-2, -1, 0, 1, 2].map(val => {
          const qVal = val * (qMax / 2);
          const pVal = val * (pMax / 2);
          return (
            <g key={val}>
              {/* q-axis ticks */}
              <line
                x1={toX(qVal)}
                y1={toY(0) - 4}
                x2={toX(qVal)}
                y2={toY(0) + 4}
                stroke="rgba(15,23,42,0.4)"
                strokeWidth="1"
              />
              {val !== 0 && (
                <text
                  x={toX(qVal)}
                  y={toY(0) + 18}
                  fontSize="10"
                  fill="rgba(15,23,42,0.6)"
                  textAnchor="middle"
                >
                  {qVal.toFixed(1)}
                </text>
              )}
              
              {/* p-axis ticks */}
              <line
                x1={toX(0) - 4}
                y1={toY(pVal)}
                x2={toX(0) + 4}
                y2={toY(pVal)}
                stroke="rgba(15,23,42,0.4)"
                strokeWidth="1"
              />
              {val !== 0 && (
                <text
                  x={toX(0) - 12}
                  y={toY(pVal) + 4}
                  fontSize="10"
                  fill="rgba(15,23,42,0.6)"
                  textAnchor="end"
                >
                  {pVal.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}

        {/* axis labels */}
        <text x={width - pad - 10} y={toY(0) - 10} fontSize="13" fill="rgba(15,23,42,0.8)" textAnchor="end" fontWeight="500">
          q (position)
        </text>
        <text x={toX(0) + 12} y={pad + 16} fontSize="13" fill="rgba(15,23,42,0.8)" fontWeight="500">
          p (momentum)
        </text>

        {/* nested ellipses with labels */}
        {ellipsePaths.map((obj) => {
          const isSelected = Math.abs(obj.E - E) < 1e-6;
          
          return (
            <g key={obj.E}>
              <path
                d={obj.d}
                fill="none"
                stroke={isSelected ? "rgba(244,63,94,0.85)" : "rgba(37,99,235,0.65)"}
                strokeWidth={isSelected ? 2.8 : 2.0}
                strokeDasharray={isSelected ? "0" : "5 5"}
              />
              
              {/* Energy labels */}
              <text
                x={toX(obj.qA) + 16}
                y={toY(0) + 5}
                fontSize="11"
                fill={isSelected ? "rgba(244,63,94,0.9)" : "rgba(37,99,235,0.75)"}
                fontWeight={isSelected ? "600" : "400"}
              >
                E={obj.E.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Trajectory trail */}
        {trail.map((pt, i) => (
          <circle
            key={i}
            cx={toX(pt.q)}
            cy={toY(pt.p)}
            r={2.5}
            fill={`rgba(245,158,11,${0.15 + (i / trail.length) * 0.5})`}
          />
        ))}

        {/* moving point */}
        <g>
          <circle cx={toX(qp.q)} cy={toY(qp.p)} r={8} fill="rgba(245,158,11,0.95)" />
          <circle cx={toX(qp.q)} cy={toY(qp.p)} r={15} fill="rgba(245,158,11,0.2)" />
        </g>
      </svg>

      <p style={{ marginTop: "0.75rem", fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
        Each closed curve represents a constant energy level. The orange point traces its orbit with period T = 2π/ω ≈ {period.toFixed(2)}s. 
        All trajectories are ellipses centered at the origin—a hallmark of the harmonic oscillator.
      </p>
    </div>
  );
}