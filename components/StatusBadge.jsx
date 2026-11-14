import { statusTone } from "@/lib/format";

export default function StatusBadge({ status, labels }) {
  return <span className={`a-badge ${statusTone(status)}`}>{labels[status] || status}</span>;
}