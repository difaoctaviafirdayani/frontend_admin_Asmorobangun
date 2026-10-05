"use client";
import CrudPage from "@/components/CrudPage";
import { assetUrl } from "@/lib/api";
import { formatRupiah, truncate } from "@/lib/format";

interface Topeng {
  id: string;
  name: string;
  character: string;
  color: string;
  price: number;
  stock: number;
  image: string;
  desc: string;
}

export default function KelolaTopengPage() {
  return (
    <CrudPage<Topeng>
      endpoint="/topeng"
      listKey="topeng"
      noun="topeng"
      createPath="/topeng"
      updatePath={(r) => `/topeng/${r.id}`}
      deletePath={(r) => `/topeng/${r.id}`}
      rowName={(r) => r.name}
      defaults={{ name: "", character: "", color: "", price: "", stock: 0, image: "", desc: "" }}
      columns={[
        {
          header: "Foto",
          render: (r) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="a-thumb" src={assetUrl(r.image)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
          ),
        },
        { header: "Nama", render: (r) => <><strong>{r.name}</strong><div className="a-muted">{truncate(r.character, 50)}</div></> },
        { header: "Warna", render: (r) => r.color || "-" },
        { header: "Harga", render: (r) => formatRupiah(r.price) },
        { header: "Stok", render: (r) => r.stock },
      ]}
      fields={[
        { name: "name", label: "Nama topeng", required: true },
        { name: "character", label: "Karakter / watak", placeholder: "mis. Tokoh utama, watak lembut" },
        { name: "color", label: "Warna" },
        { name: "price", label: "Harga (Rp)", type: "number", required: true },
        { name: "stock", label: "Stok", type: "number" },
        { name: "desc", label: "Deskripsi", type: "textarea" },
        { name: "image", label: "Foto topeng", type: "image" },
      ]}
    />
  );
}
