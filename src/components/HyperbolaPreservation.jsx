import React, { useState, useMemo } from 'react';

const width = 420;
const height = 420;
const padding = 40;

// Coordinate ranges in (x, t)
const xMin = -3;
const xMax = 3;
const tMin = -3;
const tMax = 3;

function toSvgCoords(x, t) {
  // x: horizontal, t: vertical (upwards), SVG y grows downward
  const xNorm = (x - xMin) / (xMax - xMin);
  const tNorm = (tMax - t) / (tMax - tMin); // flip t for "up"
  const sx = padding + xNorm * (width - 2 * padding);
  const sy = padding + tNorm * (height - 2 * padding);
  return [sx, sy];
}

function buildHyperbolaPath(tau) {
  const points = [];
  const phiMax = 2.0;
  const step = 0.05;

  for (let phi = -phiMax; phi <= phiMax; phi += step) {
    const x = tau * Math.sinh(phi);
    const t = tau * Math.cosh(phi);
    if (x >= xMin && x <= xMax && t >= tMin && t <= tMax) {
      const [sx, sy] = toSvgCoords(x, t);
      points.push([sx, sy]);
    }
  }

  let d = '';
  points.forEach(([sx, sy], i) => {
    d += (i === 0 ? 'M ' : ' L ') + sx + ' ' + sy;
  });
  return d;
}

function buildAxisLine({ type, v }) {
  // type: 'tPrime' (x = v t) or 'xPrime' (t = v x)
  const pts = [];

  if (type === 'tPrime') {
    // x = v t
    const tVals = [tMin, tMax];
    tVals.forEach((t) => {
      const x = v * t;
      if (x >= xMin && x <= xMax) {
        pts.push([x, t]);
      }
    });
  } else {
    // xPrime axis: t = v x
    const xVals = [xMin, xMax];
    xVals.forEach((x) => {
      const t = v * x;
      if (t >= tMin && t <= tMax) {
        pts.push([x, t]);
      }
    });
  }

  if (pts.length < 2) return '';

  const [sx1, sy1] = toSvgCoords(pts[0][0], pts[0][1]);
  const [sx2, sy2] = toSvgCoords(pts[1][0], pts[1][1]);
  return `M ${sx1} ${sy1} L ${sx2} ${sy2}`;
}

export default function HyperbolaPreservation() {
  // η = rapidity; v = tanh(η); γ = cosh(η)
  const [eta, setEta] = useState(0);

  const { v, gamma, hyperbola1, hyperbola2, tPrimeAxis, xPrimeAxis } =
    useMemo(() => {
      const v = Math.tanh(eta);
      const gamma = Math.cosh(eta);

      const hyperbola1 = buildHyperbolaPath(1); // τ^2 = 1
      const hyperbola2 = buildHyperbolaPath(2); // τ^2 = 4

      const tPrimeAxis = buildAxisLine({ type: 'tPrime', v });
      const xPrimeAxis = buildAxisLine({ type: 'xPrime', v });

      return { v, gamma, hyperbola1, hyperbola2, tPrimeAxis, xPrimeAxis };
    }, [eta]);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '2rem auto',
        padding: '1rem',
        borderRadius: '0.75rem',
        border: '1px solid rgba(148, 163, 184, 0.5)',
        background:
          'radial-gradient(circle at top, rgba(148, 163, 184, 0.18), transparent)',
      }}
    >
      <h2
        style={{
          fontSize: '1.1rem',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}
      >
        Hyperbola Preservation Under Lorentz Boosts
      </h2>
      <p
        style={{
          fontSize: '0.9rem',
          color: 'rgb(148, 163, 184)',
          textAlign: 'center',
          marginBottom: '0.75rem',
        }}
      >
        Move the slider to change the rapidity&nbsp;η. The hyperbolae{' '}
        <em>t² − x² = 1</em> and <em>t² − x² = 4</em> stay fixed, while the
        primed axes rotate around them.
      </p>

      <div style={{ marginBottom: '0.75rem' }}>
        <label
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '0.25rem',
          }}
        >
          <span>Rapidity η</span>
          <span>
            η ≈ {eta.toFixed(2)}, v ≈ {v.toFixed(2)}c, γ ≈ {gamma.toFixed(2)}
          </span>
        </label>
        <input
          type="range"
          min={-1.5}
          max={1.5}
          step={0.01}
          value={eta}
          onChange={(e) => setEta(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'block',
          margin: '0 auto',
          backgroundColor: 'rgb(15, 23, 42)',
          borderRadius: '0.75rem',
        }}
      >
        {/* background grid */}
        <defs>
          <pattern
            id="grid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(148, 163, 184, 0.25)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={height - 2 * padding}
          fill="url(#grid)"
        />

        {/* unboosted axes (x, t) */}
        {/* t-axis */}
        <path
          d={(() => {
            const [sx1, sy1] = toSvgCoords(0, tMin);
            const [sx2, sy2] = toSvgCoords(0, tMax);
            return `M ${sx1} ${sy1} L ${sx2} ${sy2}`;
          })()}
          stroke="white"
          strokeWidth="1.5"
        />
        {/* x-axis */}
        <path
          d={(() => {
            const [sx1, sy1] = toSvgCoords(xMin, 0);
            const [sx2, sy2] = toSvgCoords(xMax, 0);
            return `M ${sx1} ${sy1} L ${sx2} ${sy2}`;
          })()}
          stroke="white"
          strokeWidth="1.5"
        />

        {/* labels */}
        <text
          x={toSvgCoords(xMax, 0)[0] - 10}
          y={toSvgCoords(xMax, 0)[1] - 6}
          fill="white"
          fontSize="10"
        >
          x
        </text>
        <text
          x={toSvgCoords(0, tMax)[0] + 6}
          y={toSvgCoords(0, tMax)[1] + 12}
          fill="white"
          fontSize="10"
        >
          t
        </text>

        {/* light cone (x = ±t) */}
        <path
          d={(() => {
            const [sx1, sy1] = toSvgCoords(tMin, tMin);
            const [sx2, sy2] = toSvgCoords(tMax, tMax);
            return `M ${sx1} ${sy1} L ${sx2} ${sy2}`;
          })()}
          stroke="rgba(251, 191, 36, 0.8)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <path
          d={(() => {
            const [sx1, sy1] = toSvgCoords(-tMin, tMin);
            const [sx2, sy2] = toSvgCoords(-tMax, tMax);
            return `M ${sx1} ${sy1} L ${sx2} ${sy2}`;
          })()}
          stroke="rgba(251, 191, 36, 0.8)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* hyperbolae: t^2 - x^2 = τ^2 */}
        <path
          d={hyperbola1}
          stroke="rgb(96, 165, 250)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d={hyperbola2}
          stroke="rgb(34, 197, 94)"
          strokeWidth="2"
          fill="none"
        />

        {/* boosted axes (t', x') */}
        {tPrimeAxis && (
          <path
            d={tPrimeAxis}
            stroke="rgb(248, 250, 252)"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
        )}
        {xPrimeAxis && (
          <path
            d={xPrimeAxis}
            stroke="rgb(148, 163, 184)"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
        )}

        {/* labels for primed axes */}
        {tPrimeAxis && (
          <text
            x={toSvgCoords(0.8, 2.7)[0]}
            y={toSvgCoords(0.8, 2.7)[1]}
            fill="rgb(248, 250, 252)"
            fontSize="10"
          >
            t&apos;
          </text>
        )}
        {xPrimeAxis && (
          <text
            x={toSvgCoords(2.7, 0.8)[0]}
            y={toSvgCoords(2.7, 0.8)[1]}
            fill="rgb(148, 163, 184)"
            fontSize="10"
          >
            x&apos;
          </text>
        )}
      </svg>

      <p
        style={{
          fontSize: '0.8rem',
          marginTop: '0.5rem',
          color: 'rgb(148, 163, 184)',
        }}
      >
        Lorentz boosts are hyperbolic rotations: they tilt the coordinate axes
        while leaving the Minkowski norm t² − x² (and hence these hyperbolae)
        invariant.
      </p>
    </div>
  );
}
