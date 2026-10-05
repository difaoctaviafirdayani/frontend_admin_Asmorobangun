"use client";
import { useMemo, useState } from "react";
import { api, fileUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS, PAYMENT_LABEL, formatDate, formatDateTime, formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import { useToast } from "@/components/Toast";

interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  bookingType: string;
  userName: string;
  userEmail: string;
  date: string | null;
  notes: string;
  eventType: string | null;
  location: string | null;
  guestCount: string | number | null;
  paymentMethod: string | null;
  amount: number | null;
  proofFile: string | null;
  status: string;
  createdAt: string;
}

export default function PendaftarPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<{ bookings: Booking[] }>("/bookings"));
  const [fFacility, setFFacility] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const all = data?.bookings || [];
  const facilities = useMemo(() => [...new Set(all.map((b) => b.facilityName))], [all]);
  const rows = all.filter((b) => (!fFacility || b.facilityName === fFacility) && (!fStatus || b.status === fStatus));

  function open(b: Booking) {
    setSelected(b);
    setNewStatus(b.status);
  }

  async function saveStatus() {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/bookings/${selected.id}/status`, { method: "PATCH", body: { status: newStatus } });
      toast("Status booking diperbarui.");
      setSelected(null);
      reload();
    } catch (e: any) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="a-toolbar">
        <div className="a-filters">
          <select className="a-select" value={fFacility} onChange={(e) => setFFacility(e.target.value)}>
            <option value="">Semua Layanan</option>
            {facilities.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="a-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">Semua Status</option>
            {Object.entries(BOOKING_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="a-muted">{rows.length} data</div>
      </div>

      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>Pendaftar</th><th>Layanan</th><th>Jadwal</th><th>Bayar</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}>Memuat...</td></tr>}
              {error && <tr><td colSpan={6} className="a-empty">{error}</td></tr>}
              {!loading && !error && rows.length === 0 && <tr><td colSpan={6} className="a-empty">Tidak ada data.</td></tr>}
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.userName}<div className="a-muted">{b.userEmail}</div></td>
                  <td>{b.facilityName}</td>
                  <td>{b.date ? (/^\d{4}-\d{2}-\d{2}/.test(b.date) ? formatDate(b.date) : b.date) : "-"}</td>
                  <td>{b.paymentMethod ? PAYMENT_LABEL[b.paymentMethod] || b.paymentMethod : "-"}</td>
                  <td><StatusBadge status={b.status} labels={BOOKING_STATUS} /></td>
                  <td><button className="a-btn a-btn-ghost a-btn-sm" onClick={() => open(b)}>Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal title="Detail pendaftaran" onClose={() => setSelected(null)}>
          <DetailList
            rows={[
              ["Nama", selected.userName],
              ["Email", selected.userEmail],
              ["Layanan", selected.facilityName],
              ["Tanggal/jadwal", selected.date && /^\d{4}-\d{2}-\d{2}/.test(selected.date) ? formatDate(selected.date) : selected.date],
              ["Jenis acara", selected.eventType],
              ["Lokasi", selected.location],
              ["Jumlah tamu", selected.guestCount],
              ["Catatan", selected.notes],
              ["Nominal", selected.amount ? formatRupiah(selected.amount) : null],
              ["Metode bayar", selected.paymentMethod ? PAYMENT_LABEL[selected.paymentMethod] : null],
              ["Bukti bayar", selected.proofFile ? <a href={fileUrl(selected.proofFile)} target="_blank" rel="noreferrer">Lihat bukti</a> : "Belum diunggah"],
              ["Dibuat", formatDateTime(selected.createdAt)],
            ]}
          />
          <div className="a-field" style={{ marginTop: 16 }}>
            <label>Ubah status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {Object.entries(BOOKING_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="a-modal-foot">
            <button className="a-btn a-btn-ghost" onClick={() => setSelected(null)}>Tutup</button>
            <button className="a-btn a-btn-primary" disabled={saving || newStatus === selected.status} onClick={saveStatus}>
              {saving ? "Menyimpan..." : "Simpan status"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
