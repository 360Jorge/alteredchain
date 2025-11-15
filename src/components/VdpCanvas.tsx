import React, { useEffect, useRef, useState } from 'react';
import init, { vdp_trajectory } from '../wasm/vdp/pkg/vdp_wasm.js'; 
// adjust the path to wherever your pkg folder lives

const VdpCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize the WASM module
    init().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Parameters for Van der Pol
    const mu = 2.0;
    const x0 = 1.0;
    const y0 = 0.0;
    const dt = 0.01;
    const steps = 8000;

    // Call WASM to get trajectory
    const data = vdp_trajectory(mu, x0, y0, dt, steps);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Style
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#00ff99'; // you can change this
    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, width, height);

    // Compute bounds for auto-scaling
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < data.length; i += 2) {
      const x = data[i];
      const y = data[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    // Add a margin
    const margin = 0.2;
    const spanX = (maxX - minX) || 1;
    const spanY = (maxY - minY) || 1;

    const scaleX = (width * (1 - 2 * margin)) / spanX;
    const scaleY = (height * (1 - 2 * margin)) / spanY;

    const offsetX = width * margin - minX * scaleX;
    const offsetY = height * (1 - margin) + minY * scaleY; // invert y

    const toCanvas = (x: number, y: number) => {
      return {
        cx: x * scaleX + offsetX,
        cy: -y * scaleY + offsetY,
      };
    };

    // Draw trajectory
    ctx.beginPath();
    for (let i = 0; i < data.length; i += 2) {
      const x = data[i];
      const y = data[i + 1];
      const { cx, cy } = toCanvas(x, y);

      if (i === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();
  }, [ready]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Van der Pol Oscillator (WASM-powered)</h2>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{ border: '1px solid #444', maxWidth: '100%' }}
      />
      {!ready && <p>Loading simulation…</p>}
    </div>
  );
};

export default VdpCanvas;
