import React, { useState, useMemo, useEffect, useRef } from 'react';

const MathJaxLoader = () => {
  useEffect(() => {
    const w = window as any;
    if (!w.MathJax) {
      w.__MathJaxReady = false;
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js';
      script.async = true;
      script.onload = () => {
        w.__MathJaxReady = true;
      };
      document.head.appendChild(script);
    }
  }, []);
  return null;
};

const ConicToy: React.FC = () => {
  const [e, setE] = useState<number>(0.4);
  const equationRef = useRef<HTMLParagraphElement>(null);
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
      if (equationRef.current && w.MathJax?.typesetPromise) {
        w.MathJax.typesetPromise([equationRef.current]).catch((err: any) => console.log(err));
      } else if (w.__MathJaxReady === false) {
        setTimeout(run, 100);
      } else if (w.__MathJaxReady === true) {
        setTimeout(run, 50);
      }
    };
    run();
  }, [e]);

  const viewBoxSize = 220;
  const scale = 38;

  const conic =
    e === 0 ? 'circle' : e > 0 && e < 1 ? 'ellipse' : Math.abs(e - 1) < 1e-3 ? 'parabola' : 'hyperbola';

  return (
    <div style={{
      background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
      padding: '32px',
      borderRadius: '16px',
      color: 'white',
      maxWidth: '700px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <MathJaxLoader />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: 0.6
        }}>Conic explorer</p>
        <p style={{
          margin: 0,
          fontSize: '16px'
        }}>
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
        style={{
          width: '100%',
          height: '6px',
          marginBottom: '24px',
          cursor: 'pointer',
          accentColor: '#38bdf8'
        }}
      />

      <p
        ref={equationRef}
        style={{
          textAlign: 'center',
          fontSize: '18px',
          margin: '20px 0',
          minHeight: '50px'
        }}
      >
        {`$$r(\\theta) = \\frac{${p}}{1 + ${e.toFixed(2)}\\cos\\theta}$$`}
      </p>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          style={{ display: 'block' }}
        >
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

      <p style={{
        textAlign: 'center',
        fontSize: '13px',
        opacity: 0.7,
        margin: 0
      }}>
        0 ≤ e &lt; 1 → ellipse, e = 1 → parabola, e &gt; 1 → hyperbola.
      </p>
    </div>
  );
};

export default ConicToy;