import React, { useMemo, useState } from "react";

type Counts = {
  modulus: number;
  n: number;
  totalSubsets: number;
  counts: number[]; // counts[r] = # subsets with sum ≡ r (mod modulus)
};

function computeCounts(n: number, modulus: number): Counts {
  const totalSubsets = 1 << n; // 2^n
  const counts = Array(modulus).fill(0);

  for (let mask = 0; mask < totalSubsets; mask++) {
    let sum = 0;
    for (let bit = 0; bit < n; bit++) {
      if (mask & (1 << bit)) {
        // elements are 1..n
        sum += bit + 1;
      }
    }
    const r = ((sum % modulus) + modulus) % modulus;
    counts[r]++;
  }

  return { modulus, n, totalSubsets, counts };
}

export default function SubsetModPlayground() {
  const [modulus, setModulus] = useState<number>(2);
  const [n, setN] = useState<number>(6);

  const data = useMemo(() => computeCounts(n, modulus), [n, modulus]);

  const maxCount = Math.max(...data.counts);
  const total = data.totalSubsets;

  return (
    <div className="my-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm md:text-base">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Subset sum modulo playground
          </div>
          <div className="text-slate-100">
            Explore how sums of subsets of &#123;1,…,n&#125; distribute modulo m.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Modulus
            </span>
            <select
              value={modulus}
              onChange={(e) => setModulus(parseInt(e.target.value, 10))}
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100"
            >
              <option value={2}>m = 2</option>
              <option value={3}>m = 3</option>
              <option value={5}>m = 5</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-slate-200">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              n
            </span>
            <input
              type="range"
              min={1}
              max={12}
              value={n}
              onChange={(e) => setN(parseInt(e.target.value, 10))}
            />
            <span className="w-6 text-center text-slate-100">{n}</span>
          </label>
        </div>
      </div>

      <div className="mb-3 text-slate-200">
        Total subsets:{" "}
        <span className="font-mono font-semibold">{total}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/40 p-3">
          <table className="w-full border-collapse text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-1 pr-2 font-semibold text-slate-300">
                  Residue r
                </th>
                <th className="py-1 px-2 font-semibold text-slate-300">
                  # subsets with sum ≡ r (mod m)
                </th>
                <th className="py-1 pl-2 font-semibold text-slate-300">
                  Fraction
                </th>
              </tr>
            </thead>
            <tbody>
              {data.counts.map((count, r) => (
                <tr key={r} className="border-b border-slate-800 last:border-0">
                  <td className="py-1 pr-2 font-mono text-slate-200">{r}</td>
                  <td className="py-1 px-2 font-mono text-slate-100">
                    {count}
                  </td>
                  <td className="py-1 pl-2 font-mono text-slate-300">
                    {(count / total).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bars */}
        <div className="flex flex-col justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
          {data.counts.map((count, r) => {
            const width =
              maxCount === 0 ? 0 : (count / maxCount) * 100;
            return (
              <div key={r} className="flex items-center gap-2">
                <div className="w-6 text-right font-mono text-xs text-slate-300">
                  {r}
                </div>
                <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-slate-300"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="w-14 text-right font-mono text-xs text-slate-200">
                  {count}
                </div>
              </div>
            );
          })}
          <div className="mt-1 text-[0.7rem] text-slate-400">
            Try $m = 2$ and different $n$: you should always see the even/odd counts
            split almost perfectly in half. For $m = 3$ and $m = 5$, watch how the
            pattern changes when $n$ crosses multiples of $3$ or $5$.
          </div>
        </div>
      </div>
    </div>
  );
}
