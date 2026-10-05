"use client";
import CrudPage from "@/components/CrudPage";
import { assetUrl } from "@/lib/api";
import { formatDate, truncate } from "@/lib/format";

interface Item { id: string; title: string; caption: string; image: string; date: string }

export default function KelolaGaleriPage() {
  return (
    <CrudPage<Item>
      endpoint="/gallery"
      listKey="gallery"
      noun="foto galeri"
      createPath="/gallery"
      updatePath={(r) => `/gallery/${r.id}`}
      deletePath={(r) => `/gallery/${r.id}`}
      rowName={(r) => r.title}
      defaults={{ title: "", caption: "", image: "" }}
      columns={[
        {
          header: "Foto",
          render: (r) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="a-thumb" src={assetUrl(r.image)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
          ),
        },
        { header: "Judul", render: (r) => <strong>{r.title}</strong> },
        { header: "Keterangan", render: (r) => truncate(r.caption, 70) },
        { header: "Tanggal", render: (r) => formatDate(r.date) },
      ]}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "caption", label: "Keterangan", type: "textarea", rows: 3 },
        { name: "image", label: "Foto", type: "image", required: true },
      ]}
    />
  );
}
