"use client";
import { useState } from "react";
import { api, assetUrl, fileUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { ORDER_STATUS, PAYMENT_LABEL, cancelInfo, formatDateTime, formatRupiah, waLink } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import CancelInfoBox from "@/components/CancelInfoBox";
import { useToast } from "@/components/Toast";
import FilterPesanan from "./FilterPesanan";
import TabelPesanan from "./TabelPesanan";

// Tombol cepat di mode edit, mengikuti alur pesanan.
const QUICK = [
  { status: "diproses", label: "Bukti valid, proses", cls: "ok" },
  { status: "dikirim", label: "Kirim", cls: "done" },
  { status: "selesai", label: "Selesai", cls: "ok" },
  { status: "dibatalkan", label: "Batalkan", cls: "bad" },
];

/** Alamat kirim dalam satu blok teks (untuk ditempel ke label paket). */
function fullAddress(sh) {
  if (!sh) return "";
  return [sh.address, sh.village && `Kel. ${sh.village}`, sh.district && `Kec. ${sh.district}`, sh.city, sh.province, sh.postalCode]
    .filter(Boolean)
    .join(", ");
}

export default function PesananTopengPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api("/topeng/admin/orders"));
  const [fStatus, setFStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("info"); // "info" | "edit"
  const [newStatus, setNewStatus] = useState("");
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = (data?.orders || []).filter((o) => !fStatus || o.status === fStatus);

  function open(o, m) {
    setSelected(o);
    setMode(m);
    setNewStatus(o.status);
    setCourier(o.courier || "");
    setTracking(o.trackingNumber || "");
  }

  function close() {
    setSelected(null);
  }

  async function saveStatus() {
    if (!selected) return;
    if (newStatus === "dikirim" && (!courier.trim() || !tracking.trim())) {
      toast("Isi ekspedisi dan nomor resi dulu sebelum status Dikirim.");
      return;
    }
    setSaving(true);
    try {
      const body = { status: newStatus };
      if (newStatus === "dikirim") {
        body.courier = courier.trim();
        body.trackingNumber = tracking.trim();
      }
      await api(`/topeng/admin/orders/${selected.id}/status`, { method: "PATCH", body });
      toast("Status pesanan diperbarui.");
      close();
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  }

  const ship = selected?.shipping || null;
  const needsResi = newStatus === "dikirim";
  const resiChanged = needsResi && selected && (courier.trim() !== (selected.courier || "") || tracking.trim() !== (selected.trackingNumber || ""));
  const wa = selected
    ? waLink(ship?.recipientPhone || selected.buyerPhone, `Halo ${selected.userName}, terkait pesanan ${selected.topengName} di Sanggar Asmorobangun.`)
    : "";
  const lockedByUser = !!cancelInfo(selected || {})?.byUser;
  const proofIsPdf = selected?.proofFile ? /\.pdf($|\?)/i.test(selected.proofFile) : false;

  return (
    <div className="a-page">
      <h1 className="a-heading">Pesanan Topeng</h1>

      <FilterPesanan fStatus={fStatus} onStatusChange={setFStatus} />

      <TabelPesanan rows={rows} loading={loading} error={error} onOpen={open} />

      {/* ========== MODE INFO: hanya baca, tertata per bagian ========== */}
      {selected && mode === "info" && (
        <Modal title="Detail pesanan topeng" onClose={close}>
          <div className="a-info-head">
            {selected.topengImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="a-thumb" src={assetUrl(selected.topengImage)} alt="" onError={(e) => (e.target.style.display = "none")} />
            )}
            <div style={{ flex: 1 }}>
              <div className="a-info-name">{selected.topengName} x{selected.qty}</div>
              <div className="a-info-sub">Pemesan: {selected.userName}</div>
              <div className="a-info-sub">Total {formatRupiah(selected.total)}</div>
            </div>
            <StatusBadge status={selected.status} labels={ORDER_STATUS} />
          </div>

          <CancelInfoBox item={selected} nama={selected.topengName} phone={selected.buyerPhone || ship?.recipientPhone} />

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
            <div className="a-info-title">Alamat pengiriman</div>
            {ship ? (
              <DetailList
                rows={[
                  ["Penerima", ship.recipientName],
                  ["No. HP penerima", ship.recipientPhone],
                  ["Alamat lengkap", fullAddress(ship)],
                ]}
              />
            ) : (
              <div className="a-info-empty">Pesanan lama, belum ada alamat pengiriman.</div>
            )}
            {(selected.courier || selected.trackingNumber) && (
              <DetailList
                rows={[
                  ["Ekspedisi", selected.courier],
                  ["Nomor resi", selected.trackingNumber],
                ]}
              />
            )}
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
            {!lockedByUser && <button className="a-btn a-btn-primary" onClick={() => setMode("edit")}>Ubah status</button>}
          </div>
        </Modal>
      )}

      {/* ========== MODE EDIT: fokus mengambil keputusan ========== */}
      {selected && mode === "edit" && lockedByUser && (
        <Modal title="Ubah status pesanan" onClose={close}>
          <div className="a-change-note">Pesanan ini sudah dibatalkan oleh pembeli, jadi statusnya tidak bisa diubah lagi.</div>
          <CancelInfoBox item={selected} nama={selected.topengName} phone={selected.buyerPhone || ship?.recipientPhone} />
          <div className="a-modal-foot">
            <button className="a-btn a-btn-ghost" onClick={() => setMode("info")}>Lihat detail</button>
            <button className="a-btn a-btn-ghost" onClick={close}>Tutup</button>
          </div>
        </Modal>
      )}

      {selected && mode === "edit" && !lockedByUser && (
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
            <div className="a-quick" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
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

          {needsResi && (
            <div className="a-info-section">
              <div className="a-info-title">Info pengiriman (tampil ke pembeli)</div>
              {ship && (
                <div className="a-info-sub" style={{ marginBottom: 8 }}>
                  Kirim ke: {ship.recipientName} ({ship.recipientPhone}), {fullAddress(ship)}
                </div>
              )}
              <div className="a-field">
                <label htmlFor="kurir-pesanan">Ekspedisi</label>
                <input id="kurir-pesanan" type="text" maxLength={80} placeholder="Contoh: JNE, J&T, SiCepat" value={courier} onChange={(e) => setCourier(e.target.value)} />
              </div>
              <div className="a-field">
                <label htmlFor="resi-pesanan">Nomor resi</label>
                <input id="resi-pesanan" type="text" maxLength={80} placeholder="Nomor resi dari ekspedisi" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              </div>
            </div>
          )}

          {(newStatus !== selected.status || resiChanged) && (
            <div className="a-change-note">
              Status akan berubah dari <strong>{ORDER_STATUS[selected.status] ?? selected.status}</strong> menjadi{" "}
              <strong>{ORDER_STATUS[newStatus] ?? newStatus}</strong>.
            </div>
          )}

          <div className="a-modal-foot">
            {wa && <a className="a-btn a-btn-gold" href={wa} target="_blank" rel="noreferrer">WhatsApp pembeli</a>}
            <button className="a-btn a-btn-ghost" onClick={() => setMode("info")}>Lihat detail</button>
            <button className="a-btn a-btn-ghost" onClick={close}>Batal</button>
            <button className="a-btn a-btn-primary" disabled={saving || (newStatus === selected.status && !resiChanged)} onClick={saveStatus}>
              {saving ? "Menyimpan..." : "Simpan status"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}