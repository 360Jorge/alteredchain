import React, { useState, useMemo, useEffect } from 'react';
import MathJaxLoader from './MathJaxLoader';

const ConicToy: React.FC = () => {
  const [e, setE] = useState<number>(0.4);
  const p = 1;

  const points = useMemo(() => {
    const arr: Array<{ x: number; y: number }> = [];
    const N = 360;
    for (let i = 0; i <= N; i++) {
      const theta = (i / N) * Math.PI * 2;
      const denom = 1 + e * Math.cos(theta);
      if (Math.abs(denom) < 1e-3) continue;
      const r = p / denom;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      arr.push({ x, y });
    }
    return arr;
  }, [e]);

  useEffect(() => {
    const run = () => {
      const w = window as any;
      if (w.MathJax?.typesetPromise) {
        w.MathJax.typesetPromise();
      } else if (w.MathJax?.typeset) {
        w.MathJax.typeset();
      } else if (w.__MathJaxReady) {
        setTimeout(run, 80);
      }
    };
    const t = setTimeout(run, 50);
    return () => clearTimeout(t);
  }, [e]);

  const viewBoxSize = 220;
  const scale = 38;

  const conic =
    e === 0 ? 'circle' : e > 0 && e < 1 ? 'ellipse' : Math.abs(e - 1) < 1e-3 ? 'parabola' : 'hyperbola';

  return (
    <div className="conic-toy">
      <MathJaxLoader />

      <div className="conic-toy-top">
        <p className="conic-toy-label">Conic explorer</p>
        <p className="conic-toy-type">
          e = {e.toFixed(2)} → <strong>{conic}</strong>
        </p>
      </div>

      <input
        type="range"
        min={0}
        max={2}
        step={0.01}
        value={e}
        onChange={(ev) => setE(parseFloat(ev.target.value))}
        className="conic-toy-slider"
      />

      <p
        className="conic-toy-eq"
        dangerouslySetInnerHTML={{
          __html: `$$r(\\theta) = \\frac{${p}}{1 + ${e.toFixed(2)}\\cos\\theta}$$`,
        }}
      />

      <div className="conic-toy-svg">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          {/* axes */}
          <line
            x1={viewBoxSize / 2}
            y1={0}
            x2={viewBoxSize / 2}
            y2={viewBoxSize}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={viewBoxSize / 2}
            x2={viewBoxSize}
            y2={viewBoxSize / 2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />

          {/* curve */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
            points={points
              .map((pnt) => {
                const sx = viewBoxSize / 2 + pnt.x * scale;
                const sy = viewBoxSize / 2 - pnt.y * scale;
                return `${sx},${sy}`;
              })
              .join(' ')}
          />
        </svg>
      </div>

      <p className="conic-note">
        0 ≤ e &lt; 1 → ellipse, e = 1 → parabola, e &gt; 1 → hyperbola.
      </p>
    </div>
  );
};

export default ConicToy;
