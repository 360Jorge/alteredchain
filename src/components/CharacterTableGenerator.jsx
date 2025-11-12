import React, { useState } from "react";

const GROUPS = {
  Z4: {
    id: "Z4",
    label: "ℤ₄ (cyclic group of order 4)",
    order: 4,
    description:
      "Abelian group with generator a and a⁴ = e. All irreducible characters are 1-dimensional.",
    conjugacyClasses: [
      { id: "e", label: "e", size: 1, note: "{e}" },
      { id: "a", label: "a", size: 1, note: "{a}" },
      { id: "a2", label: "a²", size: 1, note: "{a²}" },
      { id: "a3", label: "a³", size: 1, note: "{a³}" },
    ],
    irreps: [
      {
        id: "chi0",
        label: "χ₀ (trivial)",
        degree: 1,
        row: [1, 1, 1, 1],
      },
      {
        id: "chi1",
        label: "χ₁",
        degree: 1,
        row: [1, "i", -1, "-i"],
      },
      {
        id: "chi2",
        label: "χ₂",
        degree: 1,
        row: [1, -1, 1, -1],
      },
      {
        id: "chi3",
        label: "χ₃",
        degree: 1,
        row: [1, "-i", -1, "i"],
      },
    ],
  },
  S3: {
    id: "S3",
    label: "S₃ (symmetric group on 3 letters)",
    order: 6,
    description:
      "Non-abelian group of order 6. Three conjugacy classes and three irreducible characters.",
    conjugacyClasses: [
      {
        id: "e",
        label: "e",
        size: 1,
        note: "{e}",
      },
      {
        id: "transpositions",
        label: "transpositions",
        size: 3,
        note: "{(12), (13), (23)}",
      },
      {
        id: "3cycles",
        label: "3-cycles",
        size: 2,
        note: "{(123), (132)}",
      },
    ],
    irreps: [
      {
        id: "trivial",
        label: "χ₁ (trivial)",
        degree: 1,
        row: [1, 1, 1],
      },
      {
        id: "sign",
        label: "χ₂ (sign)",
        degree: 1,
        row: [1, -1, 1],
      },
      {
        id: "standard",
        label: "χ₃ (standard)",
        degree: 2,
        row: [2, 0, -1],
      },
    ],
  },
  D4: {
    id: "D4",
    label: "D₄ (dihedral group of order 8)",
    order: 8,
    description:
      "Symmetries of the square. Five conjugacy classes; four 1-dim irreps and one 2-dim irrep.",
    conjugacyClasses: [
      { id: "e", label: "e", size: 1, note: "{e}" },
      { id: "r2", label: "r²", size: 1, note: "{r²}" },
      { id: "r_r3", label: "{r, r³}", size: 2, note: "{r, r³}" },
      { id: "s_sr2", label: "{s, sr²}", size: 2, note: "{s, sr²}" },
      { id: "sr_sr3", label: "{sr, sr³}", size: 2, note: "{sr, sr³}" },
    ],
    irreps: [
      {
        id: "A1",
        label: "χ₁ (A₁)",
        degree: 1,
        row: [1, 1, 1, 1, 1],
      },
      {
        id: "A2",
        label: "χ₂ (A₂)",
        degree: 1,
        row: [1, 1, 1, -1, -1],
      },
      {
        id: "B1",
        label: "χ₃ (B₁)",
        degree: 1,
        row: [1, 1, -1, 1, -1],
      },
      {
        id: "B2",
        label: "χ₄ (B₂)",
        degree: 1,
        row: [1, 1, -1, -1, 1],
      },
      {
        id: "E",
        label: "χ₅ (E)",
        degree: 2,
        row: [2, -2, 0, 0, 0],
      },
    ],
  },
};

function CharacterTableGenerator() {
  const [groupId, setGroupId] = useState("Z4");
  const group = GROUPS[groupId];

  return (
    <div
      className="character-table-root"
      style={{
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "1px solid rgba(148, 163, 184, 0.4)",
        background:
          "radial-gradient(circle at top left, rgba(148, 163, 184, 0.25), transparent 55%)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
            }}
          >
            Character Table Playground
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              opacity: 0.85,
              maxWidth: "32rem",
            }}
          >
            Pick a finite group and explore its irreducible characters. The rows
            are characters, the columns are conjugacy classes.
          </p>
        </div>

        <label
          style={{
            fontSize: "0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <span style={{ opacity: 0.8 }}>Choose a group</span>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{
              fontSize: "0.875rem",
              padding: "0.35rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148, 163, 184, 0.8)",
              background: "rgba(15, 23, 42, 0.85)",
              color: "inherit",
            }}
          >
            <option value="Z4">ℤ₄</option>
            <option value="S3">S₃</option>
            <option value="D4">D₄</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <p
          style={{
            fontSize: "0.85rem",
            opacity: 0.9,
          }}
        >
          <strong>{group.label}</strong> • |G| = {group.order}
        </p>
        <p
          style={{
            fontSize: "0.8rem",
            opacity: 0.8,
          }}
        >
          {group.description}
        </p>
      </div>

      <div
        style={{
          overflowX: "auto",
          marginTop: "0.75rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem",
            minWidth: "22rem",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.4rem 0.5rem",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                χ / class
              </th>
              {group.conjugacyClasses.map((cl) => (
                <th
                  key={cl.id}
                  style={{
                    textAlign: "center",
                    padding: "0.4rem 0.5rem",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.5)",
                    whiteSpace: "nowrap",
                  }}
                  title={cl.note}
                >
                  {cl.label}
                  <div
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.7,
                      marginTop: "0.1rem",
                    }}
                  >
                    size {cl.size}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.irreps.map((rep, idx) => (
              <tr
                key={rep.id}
                style={{
                  backgroundColor:
                    idx % 2 === 0
                      ? "rgba(15, 23, 42, 0.4)"
                      : "rgba(15, 23, 42, 0.2)",
                  transition: "background-color 120ms ease-out, transform 120ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(51, 65, 85, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.backgroundColor =
                    idx % 2 === 0
                      ? "rgba(15, 23, 42, 0.4)"
                      : "rgba(15, 23, 42, 0.2)";
                }}
              >
                <td
                  style={{
                    padding: "0.45rem 0.5rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div>
                    <strong>{rep.label}</strong>
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.8,
                    }}
                  >
                    degree {rep.degree}
                  </div>
                </td>
                {rep.row.map((value, i) => (
                  <td
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "0.45rem 0.5rem",
                    }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          opacity: 0.75,
        }}
      >
        Quick check: the sum of squares of the degrees equals |G|, as guaranteed
        by representation theory.
      </p>
    </div>
  );
}

export default CharacterTableGenerator;
