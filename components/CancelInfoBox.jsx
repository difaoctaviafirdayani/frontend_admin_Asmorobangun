import DetailList from "@/components/DetailList";
import { cancelInfo, cancelWaLink } from "@/lib/format";

/**
 * Kotak info pembatalan untuk modal detail pesanan/pendaftar.
 * Tampil hanya bila status "dibatalkan". Menampilkan alasan, rekening refund,
 * dan tombol WhatsApp untuk menghubungi pemesan (pengembalian dana).
 *
 * @param {{ item: Record<string, any>, nama: string, phone?: string | null }} props
 *   nama  = nama layanan/topeng (untuk teks WhatsApp)
 *   phone = nomor tujuan WhatsApp
 */
export default function CancelInfoBox({ item, nama, phone }) {
  const info = cancelInfo(item);
  if (!info) return null;
  const wa = info.byUser ? cancelWaLink(phone, nama, info.needsRefund) : "";
  return (
    <div className="a-info-section">
      <div className="a-info-title">{info.byUser ? "Dibatalkan oleh pembeli" : "Pembatalan"}</div>
      <DetailList
        rows={[
          ["Alasan", info.reason],
          ["Waktu", info.byUser ? info.cancelledAt : null],
          ...(info.byUser ? [["No. rekening refund", info.needsRefund ? info.refundAccount : "Tidak perlu (belum ada pembayaran)"]] : []),
        ]}
      />
      {info.needsRefund && (
        <div className="a-change-note">
          Pembeli sudah membayar. Hubungi pembeli lalu proses pengembalian dana ke rekening di atas.
          {wa && (
            <>
              {" "}
              <a className="a-btn a-btn-gold a-btn-sm" href={wa} target="_blank" rel="noreferrer">
                WhatsApp untuk refund
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
