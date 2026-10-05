import { statusTone } from "@/lib/format";

export default function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  return <span className={`a-badge ${statusTone(status)}`}>{labels[status] || status}</span>;
}
