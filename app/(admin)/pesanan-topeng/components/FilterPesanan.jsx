"use client";
import { ORDER_STATUS } from "@/lib/format";
import CustomSelect from "../../pendaftar/components/CustomSelect";

export default function FilterPesanan({ fStatus, onStatusChange }) {
  return (
    <div className="a-filters">
      <CustomSelect
        ariaLabel="Filter status"
        value={fStatus}
        onChange={onStatusChange}
        minWidth={220}
        options={[
          { value: "", label: "Semua Status" },
          ...Object.entries(ORDER_STATUS).map(([k, v]) => ({ value: k, label: String(v) })),
        ]}
      />
    </div>
  );
}