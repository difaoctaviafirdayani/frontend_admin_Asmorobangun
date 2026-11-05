import { ReactNode } from "react";

interface Props {
  rows: [ReactNode, ReactNode][];
}

/** Daftar detail rapi: label di kiri (abu-cokelat), nilai di kanan. Nilai kosong tampil "-". */
export default function DetailList({ rows }: Props) {
  return (
    <div className="a-rows">
      {rows.map(([label, value], i) => {
        const empty = value === null || value === undefined || value === "";
        return (
          <div className="a-row" key={i}>
            <div className="a-row-label">{label}</div>
            <div className={`a-row-value${empty ? " empty" : ""}`}>{empty ? "-" : value}</div>
          </div>
        );
      })}
    </div>
  );
}