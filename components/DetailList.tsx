import { ReactNode } from "react";

export default function DetailList({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="a-detail-list">
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt>{k}</dt>
          <dd>{v || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}
