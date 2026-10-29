import { ReactNode } from "react";

interface Props {
  rows: [string, ReactNode][];
}

/** Baris rapi: label di kiri (abu-abu), nilai di kanan. Nilai kosong ditampilkan sebagai "-". */
export default function InfoRows({ rows }: Props) {
  return (
    <div className="a-rows">
      {rows.map(([label, value]) => {
        const empty = value === null || value === undefined || value === "";
        return (
          <div className="a-row" key={label}>
            <div className="a-row-label">{label}</div>
            <div className={`a-row-value${empty ? " empty" : ""}`}>{empty ? "-" : value}</div>
          </div>
        );
      })}
    </div>
  );
}