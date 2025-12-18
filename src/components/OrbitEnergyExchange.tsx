import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function solveKepler(M: number, e: number) {
  // Solve E - e sin E = M using Newton iterations
  let E = M; // good initial guess for small/moderate e
  for (let i = 0; i < 8; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

export default function OrbitEnergyExchange() {
  const width = 720;
  const height = 420;
  const pad = 36;

  // --- orbital parameters (dimensionless / per unit mass) ---
  const [a, setA] = useState(1.0);      // semi-major axis
  const [e, setE] = useState(0.55);     // eccentricity
  const [speed, setSpeed] = useState(1.0);

  // gravitational parameter mu = GM (per unit mass)
  const mu = 1.0;

  // Derived: b
  const b = useMemo(() => a * Math.sqrt(1 - e * e), [a, e]);

  // Energy per unit mass: H = -mu/(2a)
  const Hconst = useMemo(() => -mu / (2 * a), [mu, a]);

  // animation state: mean anomaly M
  const MRef = useRef(0);
  const lastTRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const [M, setM] = useState(0);

  // Mean motion n = sqrt(mu/a^3)
  const n = useMemo(() => Math.sqrt(mu / (a * a * a)), [mu, a]);

  useEffect(() => {
    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dtRaw = (t - lastTRef.current) / 1000;
      lastTRef.current = t;

      const dt = Math.min(0.03, dtRaw);

      // advance mean anomaly
      MRef.current = (MRef.current + n * dt * speed) % (2 * Math.PI);
      setM(MRef.current);

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [n, speed]);

  // Solve Kepler for eccentric anomaly
  const Ean = useMemo(() => solveKepler(M, e), [M, e]);

  // Position in orbital plane with focus at origin (Sun at 0,0)
  const x = a * (Math.cos(Ean) - e);
  const y = b * Math.sin(Ean);

  // Radius
  const r = Math.sqrt(x * x + y * y);

  // Vis-viva
  const v2 = mu * (2 / r - 1 / a);
  const T = 0.5 * v2;      // per unit mass
  const V = -mu / r;       // per unit mass
  const H = T + V;

  // perihelion and aphelion points
  const rPeri = a * (1 - e);
  const rApo = a * (1 + e);

  // In this focus-at-origin parametrization:
  // perihelion at (a(1-e)-ae, 0) = (a(1-2e), 0)? Wait: E=0 gives x=a(1-e)-ae = a(1-2e).
  // But easier: use true geometry: perihelion is closest point on ellipse to focus along major axis.
  // With focus at origin, perihelion is at x = rPeri (to the right), aphelion at x = -rApo (to the left).
  // For this param system, that matches the focus placement if we align major axis on x.
  const peri = { x: rPeri, y: 0 };
  const apo = { x: -rApo, y: 0 };

  // view mapping: fit ellipse in SVG
  const xRange = rApo + 0.35; // extra padding
  const yRange = b + 0.35;

  const cx = width / 2;
  const cy = height / 2 + 10;

  const toX = (X: number) => cx + (X / xRange) * (width / 2 - pad);
  const toY = (Y: number) => cy - (Y / yRange) * (height / 2 - pad);

  // Gauge scaling (normalize to [0,1] range)
  // For bound orbits, H < 0. We'll display:
  // - Potential magnitude |V|
  // - Kinetic T
  // - Total |H| as a reference line
  const Vmag = Math.abs(V);
  const Hmag = Math.abs(Hconst);

  const gaugeMax = useMemo(() => {
    // rough upper bound: near perihelion Vmag largest, T largest
    // keep it stable across time for no jitter
    const Vperi = mu / rPeri;
    const Tperi = 0.5 * mu * (2 / rPeri - 1 / a);
    return Math.max(Vperi, Tperi, Hmag) * 1.15;
  }, [mu, rPeri, a, Hmag]);

  const gT = clamp(T / gaugeMax, 0, 1);
  const gV = clamp(Vmag / gaugeMax, 0, 1);
  const gH = clamp(Hmag / gaugeMax, 0, 1);

  // ellipse path (for drawing)
  const ellipsePath = useMemo(() => {
    const steps = 360;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      // param for ellipse with focus at origin:
      // use eccentric anomaly param E for shape:
      const X = a * (Math.cos(t) - e);
      const Y = b * Math.sin(t);
      const sx = toX(X);
      const sy = toY(Y);
      d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    return d;
  }, [a, b, e, xRange, yRange]);

  const reset = () => {
    MRef.current = 0;
    setM(0);
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
        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>eccentricity e = {e.toFixed(2)}</span>
          <input
            type="range"
            min={0.0}
            max={0.85}
            step={0.01}
            value={e}
            onChange={(ev) => setE(parseFloat(ev.target.value))}
            style={{ width: 220 }}
          />
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>speed = {speed.toFixed(2)}</span>
          <input
            type="range"
            min={0.2}
            max={4.0}
            step={0.01}
            value={speed}
            onChange={(ev) => setSpeed(parseFloat(ev.target.value))}
            style={{ width: 180 }}
          />
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
          r = {r.toFixed(3)} • T = {T.toFixed(3)} • |V| = {Vmag.toFixed(3)} • H = {H.toFixed(3)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Orbit with energy exchange"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.35)",
          background: "rgba(2,6,23,0.02)",
        }}
      >
        {/* Orbit path */}
        <path d={ellipsePath} fill="none" stroke="rgba(37,99,235,0.75)" strokeWidth={2.5} />

        {/* Sun at focus */}
        <g>
          <circle cx={toX(0)} cy={toY(0)} r={10} fill="rgba(244,63,94,0.95)" />
          <circle cx={toX(0)} cy={toY(0)} r={18} fill="rgba(244,63,94,0.14)" />
          <text x={toX(0) + 14} y={toY(0) + 4} fontSize="12" fill="rgba(15,23,42,0.8)">
            Sun
          </text>
        </g>

        {/* Perihelion / aphelion markers */}
        <g>
          <circle cx={toX(peri.x)} cy={toY(peri.y)} r={4} fill="rgba(15,23,42,0.6)" />
          <text x={toX(peri.x) + 8} y={toY(peri.y) + 4} fontSize="12" fill="rgba(15,23,42,0.75)">
            perihelion
          </text>

          <circle cx={toX(apo.x)} cy={toY(apo.y)} r={4} fill="rgba(15,23,42,0.6)" />
          <text x={toX(apo.x) + 8} y={toY(apo.y) + 4} fontSize="12" fill="rgba(15,23,42,0.75)">
            aphelion
          </text>
        </g>

        {/* Planet */}
        <g>
          <circle cx={toX(x)} cy={toY(y)} r={8} fill="rgba(245,158,11,0.95)" />
          <circle cx={toX(x)} cy={toY(y)} r={14} fill="rgba(245,158,11,0.15)" />
        </g>

        {/* Energy gauges (right side) */}
        {(() => {
          const gx = width - pad - 130;
          const gy = pad + 18;
          const barW = 18;
          const barH = 150;
          const gap = 18;

          const drawBar = (label: string, frac: number, x0: number, color: string) => {
            const h = frac * barH;
            return (
              <g>
                <rect
                  x={x0}
                  y={gy}
                  width={barW}
                  height={barH}
                  fill="rgba(148,163,184,0.18)"
                  stroke="rgba(148,163,184,0.45)"
                />
                <rect x={x0} y={gy + (barH - h)} width={barW} height={h} fill={color} />
                <text x={x0 + barW / 2} y={gy + barH + 16} fontSize="12" fill="rgba(15,23,42,0.75)" textAnchor="middle">
                  {label}
                </text>
              </g>
            );
          };

          // total energy reference line (|H|) across bars
          const yH = gy + (1 - gH) * barH;

          return (
            <g>
              <text x={gx} y={gy - 10} fontSize="12" fill="rgba(15,23,42,0.8)">
                Energy (per unit mass)
              </text>

              {drawBar("T", gT, gx, "rgba(34,197,94,0.75)")}
              {drawBar("|V|", gV, gx + barW + gap, "rgba(37,99,235,0.75)")}
              {drawBar("|H|", gH, gx + 2 * (barW + gap), "rgba(244,63,94,0.75)")}

              {/* constant |H| reference (drawn over first two bars) */}
              <line
                x1={gx - 6}
                y1={yH}
                x2={gx + 2 * (barW + gap) - 6}
                y2={yH}
                stroke="rgba(244,63,94,0.85)"
                strokeDasharray="6 6"
                strokeWidth={2}
              />
              <text x={gx - 10} y={yH - 8} fontSize="12" fill="rgba(244,63,94,0.85)" textAnchor="end">
                |H| const
              </text>
            </g>
          );
        })()}

        {/* Title */}
        <text x={pad} y={pad - 12} fontSize="12" fill="rgba(15,23,42,0.8)">
          As r changes, kinetic and potential energy trade — total energy stays constant.
        </text>
      </svg>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        Near perihelion the planet moves faster (T increases) and the potential well is deeper (|V| increases). The sum H stays constant for an ideal Kepler orbit.
      </p>
    </div>
  );
}
