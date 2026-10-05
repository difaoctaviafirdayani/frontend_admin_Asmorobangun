"use client";
import CrudPage from "@/components/CrudPage";
import { assetUrl } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
}

export default function KelolaArtikelPage() {
  return (
    <CrudPage<Article>
      endpoint="/articles"
      listKey="articles"
      noun="artikel"
      createPath="/articles"
      updatePath={(r) => `/articles/${r.id}`}
      deletePath={(r) => `/articles/${r.id}`}
      rowName={(r) => r.title}
      defaults={{ title: "", category: "Berita", excerpt: "", content: "", image: "" }}
      columns={[
        {
          header: "Gambar",
          render: (r) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="a-thumb" src={assetUrl(r.image)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
          ),
        },
        { header: "Judul", render: (r) => <><strong>{r.title}</strong><div className="a-muted">{r.author}</div></> },
        { header: "Kategori", render: (r) => r.category },
        { header: "Tanggal", render: (r) => formatDate(r.date) },
      ]}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "category", label: "Kategori", placeholder: "mis. Berita, Sejarah, Edukasi" },
        { name: "excerpt", label: "Ringkasan", type: "textarea", rows: 2, hint: "Kosongkan untuk memakai 140 karakter pertama isi artikel (hanya saat artikel baru)." },
        { name: "content", label: "Isi artikel", type: "textarea", rows: 10, required: true },
        { name: "image", label: "Gambar", type: "image" },
      ]}
    />
  );
}
