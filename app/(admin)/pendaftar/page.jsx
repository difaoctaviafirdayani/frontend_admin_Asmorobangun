"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS, formatRupiah } from "@/lib/format";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import { useToast } from "@/components/Toast";
import FilterPendaftar from "./components/FilterPendaftar";
import TabelPendaftar from "./components/TabelPendaftar";

export default function PendaftarPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api("/bookings/admin"));
  const [fFacility, setFFacility] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("info"); // "info" | "edit"
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const semua = data?.bookings || [];
  const facilities = Array.from(new Set(semua.map((b) => b.facilityName).filter(Boolean)));
  const rows = semua.filter(
    (b) => (!fFacility || b.facilityName === fFacility) && (!fStatus || b.status === fStatus)
  );

  function open(b, m) {
    setSelected(b);
    setMode(m);
    setNewStatus(b.status);
  }

  function close() {
    setSelected(null);
  }

  async function saveStatus() {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/bookings/${selected.id}/status`, { method: "PATCH", body: { status: newStatus } });
      toast("Status pendaftar diperbarui.");
      close();
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="a-page">
      <h1 className="a-heading">Pendaftar &amp; Booking</h1>

      <FilterPendaftar
        facilities={facilities}
        fFacility={fFacility}
        fStatus={fStatus}
        onFacilityChange={setFFacility}
        onStatusChange={setFStatus}
      />

      <TabelPendaftar rows={rows} loading={loading} error={error} onOpen={open} />

      {selected && mode === "info" && (
        <Modal title="Detail pendaftar" onClose={close}>
          <DetailList
            rows={[
              ["Nama", selected.userName],
              ["Layanan", selected.facilityName],
              ["Tanggal", selected.date],
              ["Nominal", selected.amount ? formatRupiah(selected.amount) : null],
              ["Status", BOOKING_STATUS[selected.status] ?? selected.status],
            ]}
          />
          <div className="a-modal-foot">
            <button className="a-btn a-btn-ghost" onClick={close}>Tutup</button>
            <button className="a-btn a-btn-primary" onClick={() => setMode("edit")}>Ubah status</button>
          </div>
        </Modal>
      )}

      {selected && mode === "edit" && (
        <Modal title="Ubah status pendaftar" onClose={close}>
          <div className="a-field">
            <label htmlFor="status-pendaftar">Status</label>
            <select id="status-pendaftar" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{String(v)}</option>
              ))}
            </select>
          </div>
          <div className="a-modal-foot">
            <button className="a-btn a-btn-ghost" onClick={() => setMode("info")}>Lihat detail</button>
            <button className="a-btn a-btn-ghost" onClick={close}>Batal</button>
            <button className="a-btn a-btn-primary" disabled={saving || newStatus === selected.status} onClick={saveStatus}>
              {saving ? "Menyimpan..." : "Simpan status"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}