import React, { useEffect, useRef, useState, useCallback } from "react";
import init, { vdp_trajectory } from "../wasm/vdp/pkg/vdp_wasm.js";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const VdpCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  // --- Controls ---
  const [mu, setMu] = useState<number>(2.0);

  // Initial conditions (so Reset can actually do something visible)
  const [x0, setX0] = useState<number>(1.0);
  const [y0, setY0] = useState<number>(0.0);

  // Integration params (keep as constants unless you want sliders later)
  const dt = 0.01;
  const steps = 8000;

  useEffect(() => {
    init().then(() => setReady(true));
  }, []);

  const draw = useCallback(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Compute trajectory from WASM
    const data = vdp_trajectory(mu, x0, y0, dt, steps);

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050816";
    ctx.fillRect(0, 0, width, height);

    // Compute bounds for auto-scaling
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (let i = 0; i < data.length; i += 2) {
      const x = data[i];
      const y = data[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    // Add a margin
    const margin = 0.18;
    const spanX = (maxX - minX) || 1;
    const spanY = (maxY - minY) || 1;

    const scaleX = (width * (1 - 2 * margin)) / spanX;
    const scaleY = (height * (1 - 2 * margin)) / spanY;

    const offsetX = width * margin - minX * scaleX;
    const offsetY = height * (1 - margin) + minY * scaleY; // invert y

    const toCanvas = (x: number, y: number) => ({
      cx: x * scaleX + offsetX,
      cy: -y * scaleY + offsetY,
    });

    // Draw axes lightly (optional but helps interpret Hopf visually)
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;

    // x-axis (y=0)
    {
      const a = toCanvas(minX, 0);
      const b = toCanvas(maxX, 0);
      ctx.beginPath();
      ctx.moveTo(a.cx, a.cy);
      ctx.lineTo(b.cx, b.cy);
      ctx.stroke();
    }
    // y-axis (x=0)
    {
      const a = toCanvas(0, minY);
      const b = toCanvas(0, maxY);
      ctx.beginPath();
      ctx.moveTo(a.cx, a.cy);
      ctx.lineTo(b.cx, b.cy);
      ctx.stroke();
    }
    ctx.restore();

    // Trajectory
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "#00ff99";

    ctx.beginPath();
    for (let i = 0; i < data.length; i += 2) {
      const { cx, cy } = toCanvas(data[i], data[i + 1]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Mark the equilibrium at the origin
    const o = toCanvas(0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(o.cx, o.cy, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }, [ready, mu, x0, y0]);

  // Redraw whenever parameters change
  useEffect(() => {
    draw();
  }, [draw]);

  const handleReset = () => {
    // small “fresh start” so you can see the spiral direction clearly
    setX0(1.0);
    setY0(0.0);
  };

  // Optional: make μ=0 easy to hit
  const nudgeToZero = () => setMu(0);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Van der Pol Oscillator (WASM-powered)</h2>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto 12px",
          padding: "10px 12px",
          border: "1px solid #2a2a3a",
          borderRadius: 10,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ textAlign: "left", minWidth: 220 }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            μ: <strong>{mu.toFixed(2)}</strong>
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
            Watch the origin: μ &lt; 0 spirals in, μ &gt; 0 spirals out → limit cycle.
          </div>
        </div>

        <input
          type="range"
          min={-2}
          max={4}
          step={0.05}
          value={mu}
          onChange={(e) => setMu(parseFloat(e.target.value))}
          style={{ width: "min(420px, 70vw)" }}
          aria-label="mu slider"
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={nudgeToZero}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "#0b1025",
              color: "white",
              cursor: "pointer",
            }}
          >
            μ = 0
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "#0b1025",
              color: "white",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{ border: "1px solid #444", maxWidth: "100%" }}
      />

      {!ready && <p>Loading simulation…</p>}
    </div>
  );
};

export default VdpCanvas;
