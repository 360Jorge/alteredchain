import React, { useEffect, useMemo, useRef, useState } from "react";

const W = 820;
const H = 360;
const pad = 22;
const gap = 22;
const panelW = (W - 2 * pad - gap) / 2;
const panelH = H - 2 * pad;

const gridStep = 22;

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function buildGridPath(x0: number, y0: number, w: number, h: number, step: number) {
  let d = "";
  // vertical lines
  for (let x = x0; x <= x0 + w + 0.5; x += step) {
    d += `M ${x} ${y0} L ${x} ${y0 + h} `;
  }
  // horizontal lines
  for (let y = y0; y <= y0 + h + 0.5; y += step) {
    d += `M ${x0} ${y} L ${x0 + w} ${y} `;
  }
  return d.trim();
}

function mapToPanel(
  x: number,
  y: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  panel: { x: number; y: number; w: number; h: number }
) {
  const xn = (x - xMin) / (xMax - xMin);
  const yn = (y - yMin) / (yMax - yMin);
  const sx = panel.x + xn * panel.w;
  const sy = panel.y + (1 - yn) * panel.h; // flip y
  return { sx, sy };
}

function buildEllipsePath(A: number, omega: number, panel: any) {
  // phase portrait ellipse: x=A cos θ, v=-A ω sin θ
  const N = 420;
  const vAmp = Math.max(1e-6, A * omega);

  let d = "";
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * 2 * Math.PI;
    const x = A * Math.cos(th);
    const v = -vAmp * Math.sin(th);

    const p = mapToPanel(x, v, -A, A, -vAmp, vAmp, panel);
    d += (i === 0 ? "M " : " L ") + p.sx + " " + p.sy;
  }
  return d;
}

function buildTimeSeriesPath(
  A: number,
  omega: number,
  phi: number,
  tNow: number,
  secondsVisible: number,
  panel: any
) {
  const tMin = tNow - secondsVisible;
  const tMax = tNow;
  const N = 520;

  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = tMin + (i / N) * (tMax - tMin);
    const x = A * Math.cos(omega * t + phi);
    const p = mapToPanel(t, x, tMin, tMax, -A, A, panel);
    d += (i === 0 ? "M " : " L ") + p.sx + " " + p.sy;
  }
  return d;
}

export default function SHODualSVG({
  secondsVisible = 8,
  speed = 1,
}: {
  secondsVisible?: number;
  speed?: number;
}) {
  const [omega, setOmega] = useState(1.0);
  const [A, setA] = useState(1.2);
  const [phi, setPhi] = useState(0.0);
  const [paused, setPaused] = useState(false);

  const [tNow, setTNow] = useState(0);

  const tRef = useRef(0);
  const lastRef = useRef<number | null>(null);

  // panels
  const left = useMemo(() => ({ x: pad, y: pad, w: panelW, h: panelH }), []);
  const right = useMemo(() => ({ x: pad + panelW + gap, y: pad, w: panelW, h: panelH }), []);

  // static-ish paths
  const ellipsePath = useMemo(() => buildEllipsePath(A, omega, left), [A, omega, left]);

  // grid path (both panels)
  const gridLeft = useMemo(() => buildGridPath(left.x, left.y, left.w, left.h, gridStep), [left]);
  const gridRight = useMemo(() => buildGridPath(right.x, right.y, right.w, right.h, gridStep), [right]);

  useEffect(() => {
    let raf = 0;

    const tick = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;

      if (!paused) {
        tRef.current += dt * speed;
        setTNow(tRef.current);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed]);

  // current state at time tNow
  const vAmp = Math.max(1e-6, A * omega);
  const th = omega * tNow + phi;
  const xNow = A * Math.cos(th);
  const vNow = -vAmp * Math.sin(th);

  // dots and guides
  const phaseDot = mapToPanel(xNow, vNow, -A, A, -vAmp, vAmp, left);

  // time window: keep "now" at right edge
  const tMin = tNow - secondsVisible;
  const timeDot = mapToPanel(tNow, xNow, tMin, tNow, -A, A, right);

  // time curve depends on tNow
  const timePath = useMemo(
    () => buildTimeSeriesPath(A, omega, phi, tNow, secondsVisible, right),
    [A, omega, phi, tNow, secondsVisible, right]
  );

  // axis lines
  const phaseAxisH = `M ${left.x} ${left.y + left.h / 2} L ${left.x + left.w} ${left.y + left.h / 2}`;
  const phaseAxisV = `M ${left.x + left.w / 2} ${left.y} L ${left.x + left.w / 2} ${left.y + left.h}`;
  const timeAxisH = `M ${right.x} ${right.y + right.h / 2} L ${right.x + right.w} ${right.y + right.h / 2}`;
  const timeAxisV = `M ${right.x + right.w * 0.85} ${right.y} L ${right.x + right.w * 0.85} ${right.y + right.h}`;

  // cursor line at "now" (right edge)
  const cursorX = right.x + right.w;
  const cursorLine = `M ${cursorX} ${right.y} L ${cursorX} ${right.y + right.h}`;

  return (
    <div
      style={{
        maxWidth: 920,
        margin: "2rem auto",
        padding: "1rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(148, 163, 184, 0.5)",
        background: "radial-gradient(circle at top, rgba(148, 163, 184, 0.18), transparent)",
      }}
    >
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", textAlign: "center" }}>
        Simple Harmonic Oscillator — Phase + Time
      </h2>
      <p style={{ fontSize: "0.9rem", color: "rgb(148, 163, 184)", textAlign: "center", marginBottom: "0.75rem" }}>
        The dot on the ellipse (x, v) and the dot on x(t) are the <em>same moment</em> in time.
      </p>

      <div style={{ marginBottom: "0.75rem" }}>
        <label style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.8rem", flexWrap: "wrap" }}>
          <span>ω</span>
          <span>{omega.toFixed(2)}</span>
        </label>
        <input type="range" min={0.2} max={3} step={0.01} value={omega} onChange={(e) => setOmega(parseFloat(e.target.value))} style={{ width: "100%" }} />

        <label style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.8rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          <span>A</span>
          <span>{A.toFixed(2)}</span>
        </label>
        <input type="range" min={0.2} max={2.5} step={0.01} value={A} onChange={(e) => setA(parseFloat(e.target.value))} style={{ width: "100%" }} />

        <label style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", fontSize: "0.8rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          <span>φ</span>
          <span>{phi.toFixed(2)} rad</span>
        </label>
        <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={phi} onChange={(e) => setPhi(parseFloat(e.target.value))} style={{ width: "100%" }} />

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              padding: "0.45rem 0.8rem",
              background: "rgba(15, 23, 42, 0.35)",
              color: "rgb(248, 250, 252)",
              cursor: "pointer",
            }}
          >
            {paused ? "Play" : "Pause"}
          </button>
          <button
            onClick={() => {
              // reset time so "now" alignment is obvious
              tRef.current = 0;
              lastRef.current = null;
              setTNow(0);
            }}
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              padding: "0.45rem 0.8rem",
              background: "rgba(15, 23, 42, 0.35)",
              color: "rgb(248, 250, 252)",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: "block", margin: "0 auto", backgroundColor: "rgb(15, 23, 42)", borderRadius: "0.75rem" }}
      >
        {/* grids */}
        <path d={gridLeft} stroke="rgba(148, 163, 184, 0.18)" strokeWidth="0.6" fill="none" />
        <path d={gridRight} stroke="rgba(148, 163, 184, 0.18)" strokeWidth="0.6" fill="none" />

        {/* panel borders */}
        <rect x={left.x} y={left.y} width={left.w} height={left.h} fill="none" stroke="rgba(148, 163, 184, 0.35)" />
        <rect x={right.x} y={right.y} width={right.w} height={right.h} fill="none" stroke="rgba(148, 163, 184, 0.35)" />

        {/* axes */}
        <path d={phaseAxisH} stroke="rgba(248, 250, 252, 0.35)" strokeWidth="1.2" />
        <path d={phaseAxisV} stroke="rgba(248, 250, 252, 0.35)" strokeWidth="1.2" />
        <path d={timeAxisH} stroke="rgba(248, 250, 252, 0.35)" strokeWidth="1.2" />
        <path d={timeAxisV} stroke="rgba(248, 250, 252, 0.20)" strokeWidth="1.2" strokeDasharray="5 3" />

        {/* labels */}
        <text x={left.x + left.w - 12} y={left.y + left.h / 2 - 8} fill="rgba(248, 250, 252, 0.9)" fontSize="11">
          x
        </text>
        <text x={left.x + left.w / 2 + 8} y={left.y + 14} fill="rgba(248, 250, 252, 0.9)" fontSize="11">
          v
        </text>

        <text x={right.x + right.w - 12} y={right.y + right.h / 2 - 8} fill="rgba(248, 250, 252, 0.9)" fontSize="11">
          t
        </text>
        <text x={right.x + right.w * 0.5} y={right.y + 14} fill="rgba(248, 250, 252, 0.9)" fontSize="11">
          x
        </text>

        {/* curves */}
        <path d={ellipsePath} stroke="rgb(96, 165, 250)" strokeWidth="2" fill="none" />
        <path d={timePath} stroke="rgb(34, 197, 94)" strokeWidth="2" fill="none" />

        {/* sync guides */}
        {/* phase projections */}
        <path
          d={`M ${phaseDot.sx} ${phaseDot.sy} L ${phaseDot.sx} ${left.y + left.h / 2} M ${phaseDot.sx} ${phaseDot.sy} L ${left.x + left.w / 2} ${phaseDot.sy}`}
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth="1"
        />
        {/* time cursor + horizontal level at current x */}
        <path d={cursorLine} stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" />
        <path
          d={`M ${right.x} ${timeDot.sy} L ${right.x + right.w} ${timeDot.sy}`}
          stroke="rgba(148, 163, 184, 0.22)"
          strokeWidth="1"
        />

        {/* dots */}
        <circle cx={phaseDot.sx} cy={phaseDot.sy} r={4.5} fill="rgb(248, 250, 252)" />
        <circle cx={timeDot.sx} cy={timeDot.sy} r={4.5} fill="rgb(248, 250, 252)" />

        {/* readout */}
        <text x={pad} y={H - 10} fill="rgba(248, 250, 252, 0.75)" fontSize="12">
          x={xNow.toFixed(3)}   v={vNow.toFixed(3)}   t={tNow.toFixed(2)}s
        </text>
      </svg>

      <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "rgb(148, 163, 184)" }}>
        Sync check: when the time-dot crosses the midline (x=0), the phase-dot should be near the top/bottom of the ellipse (|v| maximal).
      </p>
    </div>
  );
}
