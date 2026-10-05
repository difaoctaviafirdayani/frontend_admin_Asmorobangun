"use client";
import CrudPage from "@/components/CrudPage";
import { assetUrl } from "@/lib/api";
import { formatDate, truncate } from "@/lib/format";

interface Announcement { id: string; title: string; body: string; type: string; color: string; image: string | null; date: string }

export default function KelolaPengumumanPage() {
  return (
    <CrudPage<Announcement>
      endpoint="/announcements"
      listKey="announcements"
      noun="pengumuman"
      createPath="/announcements"
      updatePath={(r) => `/announcements/${r.id}`}
      deletePath={(r) => `/announcements/${r.id}`}
      rowName={(r) => r.title}
      defaults={{ title: "", body: "", type: "Pengumuman", color: "brown", image: "" }}
      toPayload={(v) => ({ ...v, image: v.image || null })}
      columns={[
        {
          header: "Gambar",
          render: (r) => (
            // eslint-disable-next-line @next/next/no-img-element
            r.image ? <img className="a-thumb" src={assetUrl(r.image)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} /> : <span className="a-muted">-</span>
          ),
        },
        { header: "Judul", render: (r) => <><strong>{r.title}</strong><div className="a-muted">{truncate(r.body, 70)}</div></> },
        { header: "Jenis", render: (r) => r.type },
        { header: "Tanggal", render: (r) => formatDate(r.date) },
      ]}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "type", label: "Jenis / label", placeholder: "mis. Pendaftaran dibuka, Libur, Acara" },
        {
          name: "color",
          label: "Warna label",
          type: "select",
          options: [
            { value: "brown", label: "Coklat" },
            { value: "green", label: "Hijau" },
            { value: "red", label: "Merah" },
            { value: "gold", label: "Emas" },
          ],
        },
        { name: "body", label: "Isi pengumuman", type: "textarea", rows: 5, required: true },
        { name: "image", label: "Gambar (opsional)", type: "image" },
      ]}
    />
  );
}
