"use client";
import { useState } from "react";
import { api, fileUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS, PAYMENT_LABEL, formatDate, formatRupiah } from "@/lib/format";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import { useToast } from "@/components/Toast";
import FilterPendaftar from "./FilterPendaftar";
import TabelPendaftar from "./TabelPendaftar";

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
              ["Tanggal kunjungan", selected.date ? formatDate(selected.date) : null],
              ["Jumlah peserta", selected.guestCount],
              ["Nominal", selected.amount ? formatRupiah(selected.amount) : null],
              ["Metode bayar", selected.paymentMethod ? PAYMENT_LABEL[selected.paymentMethod] ?? selected.paymentMethod : "Belum dipilih"],
              ["Catatan", selected.notes],
              ["Status", BOOKING_STATUS[selected.status] ?? selected.status],
            ]}
          />
          {selected.proofFile ? (
            <a className="a-btn a-btn-ghost a-btn-sm" href={fileUrl(selected.proofFile)} target="_blank" rel="noreferrer">
              Buka bukti bayar
            </a>
          ) : (
            <div className="a-info-empty">
              {selected.paymentMethod === "cash" ? "Tunai: dibayar langsung di sanggar." : "Bukti bayar belum diunggah."}
            </div>
          )}
          <div className="a-modal-foot">
            <button className="a-btn a-btn-ghost" onClick={close}>Tutup</button>
            <button className="a-btn a-btn-primary" onClick={() => setMode("edit")}>Ubah status</button>
          </div>
        </Modal>
      )}

      {selected && mode === "edit" && (
        <Modal title="Ubah status pendaftar" onClose={close}>
          <div className="a-info-sub" style={{ marginBottom: 8 }}>
            {selected.userName} · {selected.facilityName}. Setelah bukti bayar dicek dan valid, ubah ke &quot;Menunggu Kedatangan&quot;.
            Ubah ke &quot;Selesai&quot; setelah peserta datang atau kostum dikembalikan.
          </div>
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