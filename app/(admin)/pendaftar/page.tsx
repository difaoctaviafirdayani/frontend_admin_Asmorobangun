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

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  );
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
    <div className="a-page">
      <h1 className="a-heading">Pendaftar &amp; Booking</h1>

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

      <div className="a-card a-card-cream">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>NAMA</th><th>LAYANAN</th><th>TANGGAL</th><th>NOMINAL</th><th>STATUS</th><th>AKSI</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}>Memuat...</td></tr>}
              {error && <tr><td colSpan={6} className="a-empty">{error}</td></tr>}
              {!loading && !error && rows.length === 0 && <tr><td colSpan={6} className="a-empty">Tidak ada data.</td></tr>}
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.userName}</td>
                  <td>{b.facilityName}</td>
                  <td>{b.date ? (/^\d{4}-\d{2}-\d{2}/.test(b.date) ? formatDate(b.date) : b.date) : "-"}</td>
                  <td>{b.amount ? formatRupiah(b.amount) : "-"}</td>
                  <td><StatusBadge status={b.status} labels={BOOKING_STATUS} /></td>
                  <td>
                    <div className="a-icons">
                      <button className="a-icon-btn" aria-label="Lihat detail" title="Lihat detail" onClick={() => open(b)}>
                        <InfoIcon />
                      </button>
                      <button className="a-icon-btn" aria-label="Ubah status" title="Ubah status" onClick={() => open(b)}>
                        <EditIcon />
                      </button>
                    </div>
                  </td>
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
    </div>
  );
}
