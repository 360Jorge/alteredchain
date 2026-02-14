import React, { useMemo, useState } from "react";

type Vec2 = { x: number; y: number };

function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}
function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

/**
 * BasisGridDemo
 * - Shows same geometric vector x, but different coordinate grids (standard vs skewed basis).
 * - Uses a simple linear map: p = a*b1 + b*b2 to draw skewed grid lines.
 */
export default function BasisGridDemo() {
  // Geometry in "world units"
  const e1: Vec2 = { x: 1, y: 0 };
  const e2: Vec2 = { x: 0, y: 1 };

  // From Dr. Harmon's example:
  const b1: Vec2 = { x: 3, y: 1 };
  const b2: Vec2 = { x: 1, y: 2 };

  // Choose a vector x. We’ll keep it fixed geometrically.
  // If x = 7e1 + 4e2, then x = (7,4) in standard coords.
  const xVec: Vec2 = { x: 7, y: 4 };

  const [mode, setMode] = useState<"standard" | "skewed">("standard");

  // Viewport config
  const width = 720;
  const height = 420;

  // World bounds (min/max in world units)
  // We keep them modest so it’s readable on mobile.
  const world = useMemo(() => {
    return {
      minX: -2,
      maxX: 10,
      minY: -2,
      maxY: 8,
    };
  }, []);

  // Pixel <-> world conversion
  const toScreen = (p: Vec2) => {
    const sx = ((p.x - world.minX) / (world.maxX - world.minX)) * width;
    // invert Y axis for screen coords
    const sy =
      height - ((p.y - world.minY) / (world.maxY - world.minY)) * height;
    return { x: sx, y: sy };
  };

  // For skewed grid: point = a*b1 + b*b2
  const combo = (a: number, b: number) => add(scale(b1, a), scale(b2, b));

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: Array<{ a: Vec2; b: Vec2 }> = [];
    const step = 1;
    const n = 12; // number of lines in each direction

    if (mode === "standard") {
      // Vertical lines x = k
      for (let k = Math.floor(world.minX); k <= Math.ceil(world.maxX); k += step) {
        lines.push({ a: { x: k, y: world.minY }, b: { x: k, y: world.maxY } });
      }
      // Horizontal lines y = k
      for (let k = Math.floor(world.minY); k <= Math.ceil(world.maxY); k += step) {
        lines.push({ a: { x: world.minX, y: k }, b: { x: world.maxX, y: k } });
      }
    } else {
      // Skewed grid: lines of constant "a" (parallel to b2) and constant "b" (parallel to b1)
      // We draw a range of integer coordinates (a,b) and map them into world space.
      // line a = const: p(t) = a*b1 + t*b2
      // line b = const: p(t) = t*b1 + b*b2
      const rangeMin = -2;
      const rangeMax = n;

      for (let a = rangeMin; a <= rangeMax; a++) {
        const p1 = combo(a, rangeMin);
        const p2 = combo(a, rangeMax);
        lines.push({ a: p1, b: p2 });
      }
      for (let b = rangeMin; b <= rangeMax; b++) {
        const p1 = combo(rangeMin, b);
        const p2 = combo(rangeMax, b);
        lines.push({ a: p1, b: p2 });
      }
    }

    return lines;
  }, [mode, world]);

  // Basis vectors to display
  const basis = mode === "standard" ? { u: e1, v: e2 } : { u: b1, v: b2 };

  // Coordinate labels (hard-coded to match the doc examples)
  // x = 7e1 + 4e2 and also x = 2b1 + 1b2 in the intro example.
  const coordLabel =
    mode === "standard"
      ? "x = 7e₁ + 4e₂  (coords: [7, 4])"
      : "x = 2b₁ + 1b₂  (coords: [2, 1])";

  // Draw helpers
  const Arrow = ({
    from,
    to,
    label,
    dashed = false,
    strokeWidth = 2.5,
  }: {
    from: Vec2;
    to: Vec2;
    label?: string;
    dashed?: boolean;
    strokeWidth?: number;
  }) => {
    const a = toScreen(from);
    const b = toScreen(to);

    // Arrowhead
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    const headLen = 12;
    const left: Vec2 = {
      x: b.x - headLen * (ux * 0.9 - uy * 0.4),
      y: b.y - headLen * (uy * 0.9 + ux * 0.4),
    };
    const right: Vec2 = {
      x: b.x - headLen * (ux * 0.9 + uy * 0.4),
      y: b.y - headLen * (uy * 0.9 - ux * 0.4),
    };

    // Label position near the tip
    const mid: Vec2 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

    return (
      <>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={dashed ? "6 6" : undefined}
          opacity={dashed ? 0.65 : 1}
        />
        <polygon
          points={`${b.x},${b.y} ${left.x},${left.y} ${right.x},${right.y}`}
          fill="currentColor"
        />
        {label ? (
          <text
            x={mid.x + 8}
            y={mid.y - 8}
            fontSize="13"
            fill="currentColor"
            opacity={0.9}
          >
            {label}
          </text>
        ) : null}
      </>
    );
  };

  const origin: Vec2 = { x: 0, y: 0 };

  // Axes lines (world bounds)
  const xAxisA: Vec2 = { x: world.minX, y: 0 };
  const xAxisB: Vec2 = { x: world.maxX, y: 0 };
  const yAxisA: Vec2 = { x: 0, y: world.minY };
  const yAxisB: Vec2 = { x: 0, y: world.maxY };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 820,
        margin: "1.25rem auto",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <strong style={{ fontSize: 14 }}>Visual intuition: change the grid</strong>
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            Same vector, different basis → different coordinates.
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setMode("standard")}
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              background: mode === "standard" ? "rgba(0,0,0,0.06)" : "transparent",
              cursor: "pointer",
              fontSize: 13,
            }}
            aria-pressed={mode === "standard"}
          >
            Standard grid
          </button>
          <button
            type="button"
            onClick={() => setMode("skewed")}
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              background: mode === "skewed" ? "rgba(0,0,0,0.06)" : "transparent",
              cursor: "pointer",
              fontSize: 13,
            }}
            aria-pressed={mode === "skewed"}
          >
            Basis grid
          </button>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Basis grid demo"
          style={{ display: "block" }}
        >
          {/* Grid */}
          <g opacity={0.35}>
            {gridLines.map((ln, i) => {
              const a = toScreen(ln.a);
              const b = toScreen(ln.b);
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="currentColor"
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {/* Axes */}
          <g opacity={0.8}>
            <line
              x1={toScreen(xAxisA).x}
              y1={toScreen(xAxisA).y}
              x2={toScreen(xAxisB).x}
              y2={toScreen(xAxisB).y}
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <line
              x1={toScreen(yAxisA).x}
              y1={toScreen(yAxisA).y}
              x2={toScreen(yAxisB).x}
              y2={toScreen(yAxisB).y}
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </g>

          {/* Basis vectors */}
          <g>
            <Arrow from={origin} to={basis.u} label={mode === "standard" ? "e₁" : "b₁"} />
            <Arrow from={origin} to={basis.v} label={mode === "standard" ? "e₂" : "b₂"} />
          </g>

          {/* The vector x (fixed in space) */}
          <g>
            <Arrow from={origin} to={xVec} label="x" strokeWidth={3.2} />
          </g>

          {/* Faint dashed decomposition in current basis */}
          {mode === "standard" ? (
            <g opacity={0.7}>
              {/* x = 7e1 + 4e2: draw steps */}
              <Arrow from={origin} to={{ x: 7, y: 0 }} dashed label="7e₁" strokeWidth={2} />
              <Arrow from={{ x: 7, y: 0 }} to={xVec} dashed label="4e₂" strokeWidth={2} />
            </g>
          ) : (
            <g opacity={0.7}>
              {/* x = 2b1 + 1b2 */}
              const p1 = add(scale(b1, 2), scale(b2, 0));
              {/* JSX can't declare const in-line in a clean way; we’ll just recompute */}
              <Arrow
                from={origin}
                to={add(scale(b1, 2), scale(b2, 0))}
                dashed
                label="2b₁"
                strokeWidth={2}
              />
              <Arrow
                from={add(scale(b1, 2), scale(b2, 0))}
                to={add(scale(b1, 2), scale(b2, 1))}
                dashed
                label="1b₂"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Caption */}
          <g>
            <rect
              x={12}
              y={height - 42}
              width={width - 24}
              height={30}
              rx={10}
              fill="rgba(0,0,0,0.05)"
            />
            <text x={24} y={height - 22} fontSize="14" fill="currentColor">
              {coordLabel}
            </text>
          </g>
        </svg>

        <p style={{ margin: "10px 4px 0", fontSize: 13, opacity: 0.8 }}>
          Tip: toggle the grid. The vector <strong>x</strong> stays fixed — only the measuring system changes.
        </p>
      </div>
    </div>
  );
}
