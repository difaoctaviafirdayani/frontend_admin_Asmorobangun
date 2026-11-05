"use client";
import { useMemo, useState } from "react";
import { api, fileUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS, PAYMENT_LABEL, formatDate, formatDateTime, formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import InfoRows from "@/components/InfoRows";
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

type Mode = "info" | "edit";

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

const isIsoDate = (d?: string | null) => !!d && /^\d{4}-\d{2}-\d{2}/.test(d);
const showDate = (d?: string | null) => (d ? (isIsoDate(d) ? formatDate(d) : d) : null);

// Tombol cepat di mode edit.
const QUICK: { status: string; label: string; cls: string }[] = [
  { status: "dikonfirmasi", label: "Konfirmasi", cls: "ok" },
  { status: "ditolak", label: "Tolak", cls: "bad" },
  { status: "selesai", label: "Selesai", cls: "done" },
];

export default function PendaftarPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<{ bookings: Booking[] }>("/bookings"));
  const [fFacility, setFFacility] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [mode, setMode] = useState<Mode>("info");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const all = data?.bookings || [];
  const facilities = useMemo(() => [...new Set(all.map((b) => b.facilityName))], [all]);
  const rows = all.filter((b) => (!fFacility || b.facilityName === fFacility) && (!fStatus || b.status === fStatus));

  function open(b: Booking, m: Mode) {
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
      toast("Status booking diperbarui.");
      close();
      reload();
    } catch (e: any) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  const proofIsPdf = selected?.proofFile ? /\.pdf($|\?)/i.test(selected.proofFile) : false;

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
                  <td>{showDate(b.date) ?? "-"}</td>
                  <td>{b.amount ? formatRupiah(b.amount) : "-"}</td>
                  <td><StatusBadge status={b.status} labels={BOOKING_STATUS} /></td>
                  <td>
                    <div className="a-icons">
                      <button className="a-icon-btn" aria-label="Lihat detail" title="Lihat detail" onClick={() => open(b, "info")}>
                        <InfoIcon />
                      </button>
                      <button className="a-icon-btn" aria-label="Ubah status" title="Ubah status" onClick={() => open(b, "edit")}>
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

      {/* ========== MODE INFO: hanya baca, tertata per bagian ========== */}
      {selected && mode === "info" && (
        <Modal title="Detail pendaftaran" onClose={close}>
          <div className="a-info-head">
            <div>
              <div className="a-info-name">{selected.userName}</div>
              <div className="a-info-sub">{selected.facilityName}</div>
            </div>
            <StatusBadge status={selected.status} labels={BOOKING_STATUS} />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Pendaftar</div>
            <InfoRows
              rows={[
               ["Nama", selected.userName],
               ["Email", selected.userEmail],
              ["Dibuat", formatDateTime(selected.createdAt)],
            ]}
          />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Layanan &amp; acara</div>
            <InfoRows
             rows={[
              ["Layanan", selected.facilityName],
              ["Tanggal/jadwal", showDate(selected.date)],
              ["Jenis acara", selected.eventType],
              ["Lokasi", selected.location],
              ["Jumlah tamu", selected.guestCount],
              ["Catatan", selected.notes],
            ]}
         />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Pembayaran</div>
            <InfoRows
             rows={[
            ["Nominal", selected.amount ? formatRupiah(selected.amount) : null],
            ["Metode bayar", selected.paymentMethod ? PAYMENT_LABEL[selected.paymentMethod] ?? selected.paymentMethod : null],
             ]}
         />
            {selected.proofFile ? (
              proofIsPdf ? (
                <a className="a-btn a-btn-ghost a-btn-sm" href={fileUrl(selected.proofFile)} target="_blank" rel="noreferrer">
                  Buka bukti bayar (PDF)
                </a>
              ) : (
                <a href={fileUrl(selected.proofFile)} target="_blank" rel="noreferrer" title="Klik untuk memperbesar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="a-proof" src={fileUrl(selected.proofFile)} alt="Bukti bayar" />
                </a>
              )
            ) : (
              <div className="a-info-empty">Bukti bayar belum diunggah.</div>
            )}
          </div>

          <div className="a-modal-foot">
            {selected.userEmail && (
              <a className="a-btn a-btn-ghost" href={`mailto:${selected.userEmail}`}>Kirim email</a>
            )}
            <button className="a-btn a-btn-ghost" onClick={close}>Tutup</button>
            <button className="a-btn a-btn-primary" onClick={() => setMode("edit")}>Ubah status</button>
          </div>
        </Modal>
      )}

      {/* ========== MODE EDIT: fokus mengambil keputusan ========== */}
      {selected && mode === "edit" && (
        <Modal title="Ubah status booking" onClose={close}>
          <div className="a-info-head">
            <div>
              <div className="a-info-name">{selected.userName}</div>
              <div className="a-info-sub">
                {selected.facilityName}
                {showDate(selected.date) ? ` · ${showDate(selected.date)}` : ""}
              </div>
              {selected.amount ? <div className="a-info-sub">Nominal {formatRupiah(selected.amount)}</div> : null}
            </div>
            <StatusBadge status={selected.status} labels={BOOKING_STATUS} />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Keputusan cepat</div>
            <div className="a-quick">
              {QUICK.map((q) => (
                <button
                  key={q.status}
                  type="button"
                  className={`a-quick-btn ${q.cls}${newStatus === q.status ? " active" : ""}`}
                  onClick={() => setNewStatus(q.status)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="a-field">
            <label htmlFor="status-baru">Atau pilih status lain</label>
            <select id="status-baru" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {Object.entries(BOOKING_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {newStatus !== selected.status && (
            <div className="a-change-note">
              Status akan berubah dari <strong>{BOOKING_STATUS[selected.status] ?? selected.status}</strong> menjadi{" "}
              <strong>{BOOKING_STATUS[newStatus] ?? newStatus}</strong>.
            </div>
          )}

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