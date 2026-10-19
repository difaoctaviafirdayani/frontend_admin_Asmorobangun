import { ORDER_STATUS } from "@/lib/format";

interface FilterPesananProps {
  fStatus: string;
  onStatusChange: (value: string) => void;
}

export default function FilterPesanan({ fStatus, onStatusChange }: FilterPesananProps) {
  return (
    <div className="a-filters">
      <select
        className="a-select"
        value={fStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Semua Status</option>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}