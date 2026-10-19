import { BOOKING_STATUS } from "@/lib/format";

interface FilterPendaftarProps {
  facilities: string[];
  fFacility: string;
  fStatus: string;
  onFacilityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function FilterPendaftar({
  facilities,
  fFacility,
  fStatus,
  onFacilityChange,
  onStatusChange,
}: FilterPendaftarProps) {
  return (
    <div className="a-filters">
      <select
        className="a-select"
        value={fFacility}
        onChange={(e) => onFacilityChange(e.target.value)}
      >
        <option value="">Semua Layanan</option>
        {facilities.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        className="a-select"
        value={fStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Semua Status</option>
        {Object.entries(BOOKING_STATUS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}