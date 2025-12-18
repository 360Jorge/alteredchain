import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function norm(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

type State = { q: number; p: number };

// RK2 / midpoint integrator for 2D system
function rk2Step(y: State, dt: number, f: (y: State) => State): State {
  const k1 = f(y);
  const mid = { q: y.q + (dt / 2) * k1.q, p: y.p + (dt / 2) * k1.p };
  const k2 = f(mid);
  return { q: y.q + dt * k2.q, p: y.p + dt * k2.p };
}

export default function ConservativeVsDissipative() {
  const width = 720;
  const height = 420;
  const pad = 36;

  const panelGap = 18;
  const panelW = (width - 2 * pad - panelGap) / 2;
  const panelH = height - 2 * pad;

  // phase space limits (same for both panels)
  const qMax = 3.2;
  const pMax = 3.2;

  // UI
  const [gamma, setGamma] = useState(0.35); // damping
  const [speed, setSpeed] = useState(1.2);

  // initial conditions (same start in both panels for comparison)
  const init = useMemo<State>(() => ({ q: 2.2, p: 0.0 }), []);
  const [left, setLeft] = useState<State>(init);
  const [right, setRight] = useState<State>(init);

  const leftRef = useRef(left);
  const rightRef = useRef(right);

  useEffect(() => {
    leftRef.current = left;
  }, [left]);
  useEffect(() => {
    rightRef.current = right;
  }, [right]);

  // trails
  const maxTrail = 240;
  const [trailL, setTrailL] = useState<State[]>([init]);
  const [trailR, setTrailR] = useState<State[]>([init]);

  // reset button behavior
  const reset = () => {
    setLeft(init);
    setRight(init);
    setTrailL([init]);
    setTrailR([init]);
  };

  // vector fields
  const fConservative = (y: State): State => {
    // harmonic oscillator
    // qdot = p, pdot = -q
    return { q: y.p, p: -y.q };
  };

  const fDissipative = (y: State): State => {
    // damped oscillator
    // qdot = p, pdot = -q - γ p
    return { q: y.p, p: -y.q - gamma * y.p };
  };

  // map to panel coords
  const toPanelX = (q: number, panelX0: number) =>
    panelX0 + ((q + qMax) / (2 * qMax)) * panelW;
  const toPanelY = (p: number, panelY0: number) =>
    panelY0 + (1 - (p + pMax) / (2 * pMax)) * panelH;

  // draw a faint grid (nice but subtle)
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const ticks = [-2, -1, 0, 1, 2];
    for (const t of ticks) {
      // vertical lines q = t
      const x = (t + qMax) / (2 * qMax);
      lines.push({ x1: x, y1: 0, x2: x, y2: 1 });
      // horizontal lines p = t
      const y = 1 - (t + pMax) / (2 * pMax);
      lines.push({ x1: 0, y1: y, x2: 1, y2: y });
    }
    return lines;
  }, [qMax, pMax]);

  // energy ellipses on conservative side for context
  const ellipsePaths = useMemo(() => {
    const energies = [1.0, 2.0, 3.2, 4.6];
    const steps = 220;
    return energies.map((E) => {
      // For HO with m=k=1, H = (p^2 + q^2)/2 = E  ->  q^2 + p^2 = 2E (circles)
      const R = Math.sqrt(2 * E);
      let d = "";
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const q = R * Math.cos(t);
        const p = R * Math.sin(t);
        d +=
          i === 0
            ? `M ${q} ${p}`
            : ` L ${q} ${p}`;
      }
      return { E, d };
    });
  }, []);

  // animate
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);

  useEffect(() => {
    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dtRaw = (t - lastTRef.current) / 1000;
      lastTRef.current = t;

      // stable dt; apply speed as multiplier on dt
      const dt = Math.min(0.03, dtRaw) * speed;

      // update left
      const yL = leftRef.current;
      const nextL = rk2Step(yL, dt, fConservative);

      // keep in bounds (soft reflect)
      let qL = nextL.q;
      let pL = nextL.p;
      if (qL > qMax) qL = qMax - (qL - qMax);
      if (qL < -qMax) qL = -qMax + (-qMax - qL);
      if (pL > pMax) pL = pMax - (pL - pMax);
      if (pL < -pMax) pL = -pMax + (-pMax - pL);
      const boundedL = { q: qL, p: pL };

      // update right
      const yR = rightRef.current;
      const nextR = rk2Step(yR, dt, fDissipative);

      let qR = nextR.q;
      let pR = nextR.p;
      if (qR > qMax) qR = qMax - (qR - qMax);
      if (qR < -qMax) qR = -qMax + (-qMax - qR);
      if (pR > pMax) pR = pMax - (pR - pMax);
      if (pR < -pMax) pR = -pMax + (-pMax - pR);
      const boundedR = { q: qR, p: pR };

      leftRef.current = boundedL;
      rightRef.current = boundedR;

      setLeft(boundedL);
      setRight(boundedR);

      setTrailL((prev) => {
        const out = prev.length >= maxTrail ? prev.slice(prev.length - maxTrail + 1) : prev.slice();
        out.push(boundedL);
        return out;
      });

      setTrailR((prev) => {
        const out = prev.length >= maxTrail ? prev.slice(prev.length - maxTrail + 1) : prev.slice();
        out.push(boundedR);
        return out;
      });

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = 0;
    };
  }, [gamma, speed]);

  // readouts
  const HL = 0.5 * (left.q * left.q + left.p * left.p); // for HO with m=k=1
  const HR = 0.5 * (right.q * right.q + right.p * right.p);

  // Build SVG trail path in panel coords
  function trailPath(trail: State[], panelX0: number, panelY0: number) {
    if (trail.length < 2) return "";
    let d = "";
    for (let i = 0; i < trail.length; i++) {
      const x = toPanelX(trail[i].q, panelX0);
      const y = toPanelY(trail[i].p, panelY0);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  }

  // Convert a “math-space” path (q,p) to panel coords via scaling (used for circles)
  function transformQPPathToPanel(dQP: string, panelX0: number, panelY0: number) {
    // We wrote ellipses as M q p L q p in “math units”.
    // Convert each coordinate pair to panel coords.
    const tokens = dQP.trim().split(/\s+/);
    let out: string[] = [];
    let i = 0;
    while (i < tokens.length) {
      const cmd = tokens[i];
      out.push(cmd);
      i++;
      const q = parseFloat(tokens[i]); i++;
      const p = parseFloat(tokens[i]); i++;
      out.push(String(toPanelX(q, panelX0)));
      out.push(String(toPanelY(p, panelY0)));
    }
    return out.join(" ");
  }

  const panelY0 = pad;
  const leftX0 = pad;
  const rightX0 = pad + panelW + panelGap;

  const dTrailL = trailPath(trailL, leftX0, panelY0);
  const dTrailR = trailPath(trailR, rightX0, panelY0);

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
          <span style={{ fontSize: 13, opacity: 0.85 }}>damping γ = {gamma.toFixed(2)}</span>
          <input
            type="range"
            min={0.0}
            max={1.2}
            step={0.01}
            value={gamma}
            onChange={(e) => setGamma(parseFloat(e.target.value))}
            style={{ width: 220 }}
          />
        </label>

        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>speed = {speed.toFixed(2)}</span>
          <input
            type="range"
            min={0.3}
            max={6.0}
            step={0.01}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
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
          Left H ≈ {HL.toFixed(3)} • Right “energy” ≈ {HR.toFixed(3)}
        </div>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Conservative vs dissipative phase portraits"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.35)",
          background: "rgba(2,6,23,0.02)",
        }}
      >
        {/* panel titles */}
        <text x={leftX0} y={pad - 12} fontSize="12" fill="rgba(15,23,42,0.8)">
          Conservative (Hamiltonian): closed orbits
        </text>
        <text x={rightX0} y={pad - 12} fontSize="12" fill="rgba(15,23,42,0.8)">
          Dissipative: spirals into an attractor
        </text>

        {/* divider */}
        <line
          x1={pad + panelW + panelGap / 2}
          y1={pad - 6}
          x2={pad + panelW + panelGap / 2}
          y2={height - pad + 6}
          stroke="rgba(148,163,184,0.45)"
        />

        {/* draw each panel frame + grid + axes */}
        {[{ x0: leftX0 }, { x0: rightX0 }].map((panel, idx) => {
          const x0 = panel.x0;
          const y0 = panelY0;

          const xCenter = x0 + panelW / 2;
          const yCenter = y0 + panelH / 2;

          return (
            <g key={idx}>
              {/* frame */}
              <rect
                x={x0}
                y={y0}
                width={panelW}
                height={panelH}
                fill="none"
                stroke="rgba(148,163,184,0.45)"
              />

              {/* grid */}
              {gridLines.map((ln, i) => (
                <line
                  key={i}
                  x1={x0 + ln.x1 * panelW}
                  y1={y0 + ln.y1 * panelH}
                  x2={x0 + ln.x2 * panelW}
                  y2={y0 + ln.y2 * panelH}
                  stroke="rgba(148,163,184,0.22)"
                />
              ))}

              {/* axes */}
              <line x1={x0} y1={yCenter} x2={x0 + panelW} y2={yCenter} stroke="rgba(15,23,42,0.35)" />
              <line x1={xCenter} y1={y0} x2={xCenter} y2={y0 + panelH} stroke="rgba(15,23,42,0.25)" />

              {/* axis labels */}
              <text x={x0 + panelW - 8} y={yCenter - 8} fontSize="12" fill="rgba(15,23,42,0.75)" textAnchor="end">
                q
              </text>
              <text x={xCenter + 10} y={y0 + 14} fontSize="12" fill="rgba(15,23,42,0.75)">
                p
              </text>
            </g>
          );
        })}

        {/* conservative: energy circles */}
        <g>
          {ellipsePaths.map((obj, idx) => (
            <path
              key={idx}
              d={transformQPPathToPanel(obj.d, leftX0, panelY0)}
              fill="none"
              stroke="rgba(37,99,235,0.35)"
              strokeWidth={1.6}
              strokeDasharray="6 8"
            />
          ))}
        </g>

        {/* trails */}
        <path d={dTrailL} fill="none" stroke="rgba(245,158,11,0.65)" strokeWidth={2.2} />
        <path d={dTrailR} fill="none" stroke="rgba(245,158,11,0.65)" strokeWidth={2.2} />

        {/* particles */}
        <g>
          <circle cx={toPanelX(left.q, leftX0)} cy={toPanelY(left.p, panelY0)} r={8} fill="rgba(245,158,11,0.95)" />
          <circle cx={toPanelX(left.q, leftX0)} cy={toPanelY(left.p, panelY0)} r={14} fill="rgba(245,158,11,0.15)" />
        </g>
        <g>
          <circle cx={toPanelX(right.q, rightX0)} cy={toPanelY(right.p, panelY0)} r={8} fill="rgba(245,158,11,0.95)" />
          <circle cx={toPanelX(right.q, rightX0)} cy={toPanelY(right.p, panelY0)} r={14} fill="rgba(245,158,11,0.15)" />
        </g>
      </svg>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        Left: energy stays constant, so trajectories don’t spiral. Right: damping removes energy, so trajectories spiral into an attractor.
      </p>
    </div>
  );
}
