// CoffeeAdvection1D.tsx
import React, { useEffect, useRef, useState } from "react";

type FlowPreset = "uniform" | "shear" | "sine";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// periodic wrap on [0,1)
function wrap01(x: number) {
  x = x % 1;
  return x < 0 ? x + 1 : x;
}

export default function CoffeeAdvection1D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState<FlowPreset>("shear");
  const [speed, setSpeed] = useState(0.9);
  const [diffusion, setDiffusion] = useState(false);

  // time for subtle shimmer
  const timeRef = useRef(0);

  // Grid + timestep
  const N = 700;
  const dt = 0.002;

  // State arrays
  const cRef = useRef<Float32Array>(new Float32Array(N));
  const cNextRef = useRef<Float32Array>(new Float32Array(N));
  const vRef = useRef<Float32Array>(new Float32Array(N));

  const computeVelocity = (x: number) => {
    if (preset === "uniform") return 0.65;
    if (preset === "shear") return (2 * x - 1) * 0.85;
    return Math.sin(2 * Math.PI * x) * 0.85;
  };

  const reset = () => {
    const c = cRef.current;
    // initial bump (Gaussian)
    const center = 0.28;
    const sigma = 0.045;

    for (let i = 0; i < N; i++) {
      const x = i / N;
      const d = Math.min(Math.abs(x - center), 1 - Math.abs(x - center)); // periodic distance
      c[i] = Math.exp(-(d * d) / (2 * sigma * sigma));
    }
  };

  const resample = (arr: Float32Array, x: number) => {
    const s = x * N;
    const i0 = Math.floor(s) % N;
    const t = s - Math.floor(s);
    const i1 = (i0 + 1) % N;
    return lerp(arr[i0], arr[i1], t);
  };

  const applyDiffusion = (arr: Float32Array) => {
    // tiny smoothing
    const tmp = cNextRef.current;
    for (let i = 0; i < N; i++) {
      const im = (i - 1 + N) % N;
      const ip = (i + 1) % N;
      tmp[i] = 0.25 * arr[im] + 0.5 * arr[i] + 0.25 * arr[ip];
    }
    arr.set(tmp);
  };

  const step = () => {
    const c = cRef.current;
    const cNext = cNextRef.current;
    const v = vRef.current;

    // update velocity samples
    for (let i = 0; i < N; i++) {
      const x = i / N;
      v[i] = computeVelocity(x) * speed;
    }

    // semi-Lagrangian advection
    for (let i = 0; i < N; i++) {
      const x = i / N;
      const xBack = wrap01(x - v[i] * dt);
      cNext[i] = resample(c, xBack);
    }

    c.set(cNext);
    if (diffusion) applyDiffusion(c);

    // advance display-time (for tiny shimmer)
    timeRef.current += running ? 0.016 : 0.0;
  };

  const drawGlowPath = (ctx: CanvasRenderingContext2D, points: Array<[number, number]>) => {
    // glow pass
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(0, 255, 180, 1)";
    ctx.beginPath();
    points.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();

    // core pass
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(0, 255, 180, 1)";
    ctx.beginPath();
    points.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();

    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const c = cRef.current;
    const v = vRef.current;

    ctx.clearRect(0, 0, W, H);

    // --- Background: match your Van der Pol vibe (deep navy gradient) ---
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.55, 20, W * 0.5, H * 0.55, Math.max(W, H) * 0.75);
    bg.addColorStop(0, "#0b1020");
    bg.addColorStop(1, "#050713");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Layout
    const pad = 32;
    const topH = Math.floor(H * 0.63);
    const dividerY = topH + 6;

    // subtle panel bounds like your other animation
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    // axes crosshair for the top panel (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.moveTo(W * 0.5, pad + 18);
    ctx.lineTo(W * 0.5, dividerY - 12);
    ctx.stroke();

    // --- Top panel: instead of “texture fill”, we do a clean dark field + neon profile ---
    // draw a faint baseline in the top panel
    const baseY = pad + (topH - pad) * 0.62;
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.moveTo(pad, baseY);
    ctx.lineTo(W - pad, baseY);
    ctx.stroke();

    // Build path points for the concentration “ribbon”
    const points: Array<[number, number]> = [];
    const t = timeRef.current;

    for (let px = pad; px <= W - pad; px++) {
      const xNorm = (px - pad) / (W - 2 * pad);
      const i = Math.floor(xNorm * N) % N;
      const val = clamp01(c[i]);

      // subtle shimmer (suggestion #1): tiny vertical wobble, barely visible
      const wobble = 0.006 * Math.sin(6 * Math.PI * xNorm + t * 0.9); // keep small!
      const y = baseY - val * (topH - pad) * 0.23 + wobble * (topH - pad);

      points.push([px, y]);
    }

    // draw glow path (signature neon)
    drawGlowPath(ctx, points);

    // --- Divider between panels ---
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(pad, dividerY);
    ctx.lineTo(W - pad, dividerY);
    ctx.stroke();

    // --- Bottom panel: velocity arrows with magnitude-based contrast (suggestion #2) ---
    const bottomTop = dividerY + 10;
    const bottomH = H - pad - bottomTop;

    const labelY1 = pad + 18;
    const labelY2 = bottomTop + 16;

    // labels (clean, like your other animation)
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("cream concentration  c(x,t)", pad + 14, labelY1);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "500 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("velocity field  v(x)", pad + 14, labelY2);

    // arrow baseline
    const arrowY = bottomTop + bottomH * 0.60;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(pad, arrowY);
    ctx.lineTo(W - pad, arrowY);
    ctx.stroke();

    const nArrows = 28;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let k = 0; k < nArrows; k++) {
      const xNorm = (k + 0.5) / nArrows;
      const px = pad + xNorm * (W - 2 * pad);
      const i = Math.floor(xNorm * N) % N;
      const vv = v[i];

      const dir = vv >= 0 ? 1 : -1;
      const mag = Math.min(1, Math.abs(vv)); // 0..1-ish

      // length encodes magnitude
      const baseLen = 34;
      const len = Math.max(7, Math.min(baseLen, mag * baseLen));

      // alpha encodes magnitude too (suggestion)
      const edgeFade = Math.sin(Math.PI * xNorm);
      const alpha = (0.20 + 0.75 * mag) * (0.45 + 0.55 * edgeFade);

      // slight neon tint to match your other work
      ctx.strokeStyle = `rgba(0, 255, 180, ${alpha})`;
      ctx.fillStyle = `rgba(0, 255, 180, ${alpha})`;
      ctx.lineWidth = 2;

      // shaft
      ctx.beginPath();
      ctx.moveTo(px - dir * len, arrowY);
      ctx.lineTo(px + dir * len, arrowY);
      ctx.stroke();

      // head
      ctx.beginPath();
      ctx.moveTo(px + dir * len, arrowY);
      ctx.lineTo(px + dir * (len - 8), arrowY - 6);
      ctx.lineTo(px + dir * (len - 8), arrowY + 6);
      ctx.closePath();
      ctx.fill();
    }
  };

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    reset();
  }, [preset]);

  useEffect(() => {
    let raf = 0;

    const loop = () => {
      if (running) step();
      draw();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, preset, speed, diffusion]);

  return (
    <div className="w-full max-w-4xl mx-auto">
     

      {/* Control card matching your VdP vibe */}
      <div className="border border-black/20 rounded-2xl p-5 mb-6 bg-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-semibold">speed: {speed.toFixed(2)}</div>
            <div className="text-sm text-gray-600">
              The cream does not diffuse at first — it is carried by the flow.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRunning(false)}
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
            >
              pause
            </button>
            <button
              onClick={() => setRunning(true)}
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
            >
              play
            </button>
            <button
              onClick={() => {
                setRunning(false);
                reset();
              }}
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
            >
              reset
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <span className="font-medium">flow</span>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as FlowPreset)}
              className="px-3 py-2 rounded-xl border border-black/20"
            >
              <option value="uniform">uniform</option>
              <option value="shear">shear</option>
              <option value="sine">sine</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="font-medium">speed</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-72"
            />
            <span className="tabular-nums w-12">{speed.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={diffusion}
              onChange={(e) => setDiffusion(e.target.checked)}
            />
            <span className="font-medium">diffusion</span>
          </label>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full">
        <canvas
          ref={canvasRef}
          width={980}
          height={520}
          className="w-full rounded-2xl bg-black shadow"
        />
      </div>
    </div>
  );
}
