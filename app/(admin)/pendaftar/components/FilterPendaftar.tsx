import { BOOKING_STATUS } from "@/lib/format";
import CustomSelect from "./CustomSelect";

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
      <CustomSelect
        ariaLabel="Filter layanan"
        value={fFacility}
        onChange={onFacilityChange}
        minWidth={220}
        options={[
          { value: "", label: "Semua Layanan" },
          ...facilities.map((f) => ({ value: f, label: f })),
        ]}
      />

      <CustomSelect
        ariaLabel="Filter status"
        value={fStatus}
        onChange={onStatusChange}
        minWidth={200}
        options={[
          { value: "", label: "Semua Status" },
          ...Object.entries(BOOKING_STATUS).map(([k, v]) => ({ value: k, label: String(v) })),
        ]}
      />
    </div>
  );
}