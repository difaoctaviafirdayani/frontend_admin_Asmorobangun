"use client";
import { useState } from "react";
import { api, assetUrl, fileUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { ORDER_STATUS, PAYMENT_LABEL, formatDateTime, formatRupiah, waLink } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import { useToast } from "@/components/Toast";

interface Order {
  id: string;
  topengName: string;
  topengImage: string;
  userName: string;
  buyerPhone: string;
  qty: number;
  unitPrice: number | string;
  total: number;
  customName: string | null;
  customDesign: string | null;
  message: string;
  paymentMethod: string | null;
  proofFile: string | null;
  status: string;
  createdAt: string;
  chatLog: { from: string; text: string; date: string }[];
}

type Mode = "info" | "edit";

// Figma menampilkan tanggal sebagai dd/mm/yyyy
function tanggal(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
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

// Tombol cepat di mode edit, mengikuti alur pesanan.
const QUICK: { status: string; label: string; cls: string }[] = [
  { status: "dikonfirmasi", label: "Konfirmasi", cls: "ok" },
  { status: "diproses", label: "Proses", cls: "done" },
  { status: "dikirim", label: "Kirim", cls: "done" },
  { status: "selesai", label: "Selesai", cls: "ok" },
  { status: "ditolak", label: "Tolak", cls: "bad" },
];

export default function PesananTopengPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<{ orders: Order[] }>("/topeng/admin/orders"));
  const [fStatus, setFStatus] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [mode, setMode] = useState<Mode>("info");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = (data?.orders || []).filter((o) => !fStatus || o.status === fStatus);

  function open(o: Order, m: Mode) {
    setSelected(o);
    setMode(m);
    setNewStatus(o.status);
  }

  function close() {
    setSelected(null);
  }

  async function saveStatus() {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/topeng/admin/orders/${selected.id}/status`, { method: "PATCH", body: { status: newStatus } });
      toast("Status pesanan diperbarui.");
      close();
      reload();
    } catch (e: any) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  const wa = selected
    ? waLink(selected.buyerPhone, `Halo ${selected.userName}, terkait pesanan ${selected.topengName} di Sanggar Asmorobangun.`)
    : "";
  const proofIsPdf = selected?.proofFile ? /\.pdf($|\?)/i.test(selected.proofFile) : false;

  return (
    <div className="a-page">
      <h1 className="a-heading">Pesanan Topeng</h1>

      <div className="a-filters">
        <select className="a-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="a-card a-card-cream">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>NAMA</th>
                <th>TOPENG</th>
                <th style={{ textAlign: "center" }}>JUMLAH</th>
                <th>TANGGAL</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}>Memuat...</td></tr>}
              {error && <tr><td colSpan={6} className="a-empty">{error}</td></tr>}
              {!loading && !error && rows.length === 0 && <tr><td colSpan={6} className="a-empty">Tidak ada pesanan.</td></tr>}
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>{o.userName}</td>
                  <td>{o.topengName}</td>
                  <td style={{ textAlign: "center" }}>{o.qty}</td>
                  <td>{tanggal(o.createdAt)}</td>
                  <td><StatusBadge status={o.status} labels={ORDER_STATUS} /></td>
                  <td>
                    <div className="a-icons">
                      <button className="a-icon-btn" aria-label="Lihat detail" title="Lihat detail" onClick={() => open(o, "info")}>
                        <InfoIcon />
                      </button>
                      <button className="a-icon-btn" aria-label="Ubah status" title="Ubah status" onClick={() => open(o, "edit")}>
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
        <Modal title="Detail pesanan topeng" onClose={close}>
          <div className="a-info-head">
            {selected.topengImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="a-thumb" src={assetUrl(selected.topengImage)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            )}
            <div style={{ flex: 1 }}>
              <div className="a-info-name">{selected.topengName} x{selected.qty}</div>
              <div className="a-info-sub">Pemesan: {selected.userName}</div>
              <div className="a-info-sub">Total {formatRupiah(selected.total)}</div>
            </div>
            <StatusBadge status={selected.status} labels={ORDER_STATUS} />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Pemesan</div>
            <DetailList
              rows={[
                ["Nama", selected.userName],
                ["No. HP", selected.buyerPhone],
                ["Dibuat", formatDateTime(selected.createdAt)],
              ]}
            />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Pesanan</div>
            <DetailList
              rows={[
                ["Topeng", selected.topengName],
                ["Jumlah", selected.qty],
                ["Harga satuan", formatRupiah(selected.unitPrice)],
                ["Total", formatRupiah(selected.total)],
                ["Nama custom", selected.customName],
                ["Desain custom", selected.customDesign],
                ["Pesan", selected.message],
              ]}
            />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Pembayaran</div>
            <DetailList
              rows={[["Metode bayar", selected.paymentMethod ? PAYMENT_LABEL[selected.paymentMethod] ?? selected.paymentMethod : null]]}
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

          {selected.chatLog?.length > 0 && (
            <div className="a-info-section">
              <div className="a-info-title">Riwayat pesanan</div>
              <div className="a-chat">
                {selected.chatLog.map((m, i) => (
                  <div className="a-chat-msg" key={i}>
                    {m.text}
                    <div className="a-muted">{m.from} · {formatDateTime(m.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="a-modal-foot">
            {wa && <a className="a-btn a-btn-gold" href={wa} target="_blank" rel="noreferrer">WhatsApp pembeli</a>}
            <button className="a-btn a-btn-ghost" onClick={close}>Tutup</button>
            <button className="a-btn a-btn-primary" onClick={() => setMode("edit")}>Ubah status</button>
          </div>
        </Modal>
      )}

      {/* ========== MODE EDIT: fokus mengambil keputusan ========== */}
      {selected && mode === "edit" && (
        <Modal title="Ubah status pesanan" onClose={close}>
          <div className="a-info-head">
            <div style={{ flex: 1 }}>
              <div className="a-info-name">{selected.userName}</div>
              <div className="a-info-sub">{selected.topengName} x{selected.qty} · {formatRupiah(selected.total)}</div>
              {(selected.customName || selected.customDesign) && (
                <div className="a-info-sub">Custom: {[selected.customName, selected.customDesign].filter(Boolean).join(" / ")}</div>
              )}
            </div>
            <StatusBadge status={selected.status} labels={ORDER_STATUS} />
          </div>

          <div className="a-info-section">
            <div className="a-info-title">Keputusan cepat</div>
            <div className="a-quick a-quick-5">
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
            <label htmlFor="status-pesanan">Atau pilih status lain</label>
            <select id="status-pesanan" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {newStatus !== selected.status && (
            <div className="a-change-note">
              Status akan berubah dari <strong>{ORDER_STATUS[selected.status] ?? selected.status}</strong> menjadi{" "}
              <strong>{ORDER_STATUS[newStatus] ?? newStatus}</strong>.
            </div>
          )}

          <div className="a-modal-foot">
            {wa && <a className="a-btn a-btn-gold" href={wa} target="_blank" rel="noreferrer">WhatsApp pembeli</a>}
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