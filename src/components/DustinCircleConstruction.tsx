import { useState } from "react";

const WIDTH = 520;
const HEIGHT = 460; // taller so the full circle fits

// Triangle vertices
const A = { x: 120, y: 360 };
const B = { x: 260, y: 80 };
const C = { x: 420, y: 340 };

// Circumcenter and radius (exactly computed from A, B, C)
const center = { x: 263.79, y: 256.90 };
const R = 176.94;

// Perpendicular bisector of AB (through midpoint (190,220) with slope 1/2)
const bisectorAB = {
  x1: 0,
  y1: 125.0,
  x2: WIDTH,
  y2: 385.0,
};

// Perpendicular bisector of BC (through midpoint (340,210) with slope -8/13)
const bisectorBC = {
  x1: 0,
  y1: 419.23,
  x2: WIDTH,
  y2: 99.23,
};

const steps = [
  {
    title: "Step 1 — Three frequency hits",
    description:
      "We mark the three locations where Dustin’s tracker picked up the weird interference. These are our points A, B, and C on the wall.",
  },
  {
    title: "Step 2 — Connect the dots",
    description:
      "We connect A, B, and C to form triangle ABC. The circle we’re looking for will pass through all three vertices.",
  },
  {
    title: "Step 3 — Midpoints and perpendicular bisectors",
    description:
      "We draw the perpendicular bisectors of AB and BC. Where these construction lines cross is the circumcenter — the center of the circle.",
  },
  {
    title: "Step 4 — The circumcircle appears",
    description:
      "Using the circumcenter and the distance to A, we draw the unique circle passing through all three points. That’s the Upside Down wall.",
  },
];

export default function DustinCircleConstruction() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const showTriangle = stepIndex >= 1;
  const showBisectors = stepIndex >= 2;
  const showCircle = stepIndex >= 3;

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "2rem auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          background: "#fdf8f0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="auto"
          style={{ display: "block", margin: "0 auto" }}
        >
          {/* light map-like background grid */}
          <defs>
            <pattern
              id="lightGrid"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#e4ddce"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
            fill="url(#lightGrid)"
          />

          {/* Triangle edges */}
          {showTriangle && (
            <polyline
              points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${A.x},${A.y}`}
              fill="none"
              stroke="#444"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Perpendicular bisectors as light construction lines */}
          {showBisectors && (
            <>
              <line
                x1={bisectorAB.x1}
                y1={bisectorAB.y1}
                x2={bisectorAB.x2}
                y2={bisectorAB.y2}
                stroke="#666"
                strokeWidth={1.4}
                strokeDasharray="6 4"
                strokeLinecap="round"
                opacity={0.9}
              />
              <line
                x1={bisectorBC.x1}
                y1={bisectorBC.y1}
                x2={bisectorBC.x2}
                y2={bisectorBC.y2}
                stroke="#666"
                strokeWidth={1.4}
                strokeDasharray="6 4"
                strokeLinecap="round"
                opacity={0.9}
              />
              {/* circumcenter */}
              <circle cx={center.x} cy={center.y} r={4} fill="#222" />
              <text
                x={center.x + 8}
                y={center.y - 8}
                fontSize="14"
                fill="#444"
              >
                O
              </text>
            </>
          )}

          {/* Circumcircle */}
          {showCircle && (
            <circle
              cx={center.x}
              cy={center.y}
              r={R}
              fill="none"
              stroke="#222"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          )}

          {/* Points A, B, C (always visible) */}
          {[{ ...A, label: "A" }, { ...B, label: "B" }, { ...C, label: "C" }].map(
            (p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r={4.5} fill="#222" />
                <text
                  x={p.x + 8}
                  y={p.y - 8}
                  fontSize="14"
                  fill="#444"
                >
                  {p.label}
                </text>
              </g>
            )
          )}
        </svg>

        <div style={{ marginTop: "1rem" }}>
          <h3
            style={{
              margin: "0 0 0.25rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {step.title}
          </h3>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5 }}>
            {step.description}
          </p>
        </div>

        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            style={{
              flex: 1,
              padding: "0.4rem 0.6rem",
              borderRadius: "999px",
              border: "1px solid #ccc",
              background: stepIndex === 0 ? "#f5f5f5" : "#faf6ef",
              cursor: stepIndex === 0 ? "default" : "pointer",
              fontSize: "0.9rem",
            }}
          >
            ← Previous
          </button>
          <div
            style={{
              alignSelf: "center",
              fontSize: "0.85rem",
              color: "#777",
            }}
          >
            Step {stepIndex + 1} / {steps.length}
          </div>
          <button
            type="button"
            onClick={() =>
              setStepIndex((i) => Math.min(steps.length - 1, i + 1))
            }
            disabled={stepIndex === steps.length - 1}
            style={{
              flex: 1,
              padding: "0.4rem 0.6rem",
              borderRadius: "999px",
              border: "1px solid #ccc",
              background:
                stepIndex === steps.length - 1 ? "#f5f5f5" : "#faf6ef",
              cursor:
                stepIndex === steps.length - 1 ? "default" : "pointer",
              fontSize: "0.9rem",
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
