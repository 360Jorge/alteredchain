import React, { useMemo, useState } from "react";

type Item = {
  id: string;
  symmetryTitle: string;
  symmetryDesc: string;
  conservedTitle: string;
  conservedDesc: string;
  example: string;
};

export default function NoetherMap() {
  const items = useMemo<Item[]>(
    () => [
      {
        id: "time",
        symmetryTitle: "Time translation symmetry",
        symmetryDesc: "The laws don’t change if you shift time: t → t + c.",
        conservedTitle: "Energy",
        conservedDesc: "Total energy stays constant in an isolated system.",
        example: "Kepler orbit: kinetic ↔ potential, but total H stays constant.",
      },
      {
        id: "space",
        symmetryTitle: "Space translation symmetry",
        symmetryDesc: "The laws don’t change if you shift position: x → x + a.",
        conservedTitle: "Linear momentum",
        conservedDesc: "Total momentum stays constant if no external force acts.",
        example: "Collisions: momentum before = momentum after (isolated system).",
      },
      {
        id: "rotation",
        symmetryTitle: "Rotational symmetry",
        symmetryDesc: "The laws don’t change under rotations in space.",
        conservedTitle: "Angular momentum",
        conservedDesc: "Angular momentum stays constant if no external torque acts.",
        example: "Planetary motion stays planar; figure skater spins faster when pulling in arms.",
      },
      {
        id: "phase",
        symmetryTitle: "Phase (gauge) symmetry (advanced)",
        symmetryDesc: "In quantum mechanics, global phase doesn’t change physics.",
        conservedTitle: "Charge / probability current",
        conservedDesc: "Leads to charge conservation (or probability conservation in QM).",
        example: "Continuity equation: probability doesn’t disappear, it flows.",
      },
    ],
    []
  );

  const [activeId, setActiveId] = useState(items[0].id);
  const [expanded, setExpanded] = useState(false);

  const active = items.find((x) => x.id === activeId) ?? items[0];

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
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Click a symmetry → see the conserved quantity (Noether’s theorem).
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            padding: "7px 12px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.45)",
            background: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {expanded ? "Hide details" : "Show details"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* LEFT: symmetry list */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(2,6,23,0.02)",
            padding: "0.9rem",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Symmetry
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {items.map((it) => {
              const active = it.id === activeId;
              return (
                <button
                  key={it.id}
                  onClick={() => setActiveId(it.id)}
                  style={{
                    textAlign: "left",
                    padding: "12px 12px",
                    borderRadius: 14,
                    cursor: "pointer",
                    border: active
                      ? "1px solid rgba(244,63,94,0.65)"
                      : "1px solid rgba(148,163,184,0.35)",
                    background: active
                      ? "rgba(244,63,94,0.08)"
                      : "rgba(255,255,255,0.45)",
                    boxShadow: active
                      ? "0 8px 20px rgba(244,63,94,0.10)"
                      : "none",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>
                    {it.symmetryTitle}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                    {it.symmetryDesc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: conserved quantity panel */}
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(2,6,23,0.02)",
            padding: "0.9rem",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Conserved quantity
          </div>

          <div
            style={{
              borderRadius: 14,
              border: "1px solid rgba(34,197,94,0.35)",
              background: "rgba(34,197,94,0.08)",
              padding: "12px 12px",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.92 }}>
              {active.conservedTitle}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
              {active.conservedDesc}
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Example: {active.example}
            </div>
          </div>

          {expanded && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8, lineHeight: 1.45 }}>
              <div style={{ fontWeight: 650, marginBottom: 6 }}>What Noether says (informal)</div>
              <div>
                If the action (or equations of motion) stays the same under a continuous transformation,
                then there exists a quantity that stays constant along trajectories.
              </div>
              <div style={{ marginTop: 10, opacity: 0.75 }}>
                This is why Hamiltonian mechanics loves symmetry: it turns “invariance” into “conservation.”
              </div>
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: "0.65rem", fontSize: 13, opacity: 0.8 }}>
        Symmetry is structure. Conservation is the shadow it casts on dynamics.
      </p>
    </div>
  );
}
