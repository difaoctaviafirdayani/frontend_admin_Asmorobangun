"use client";

import React, { useState } from "react";
import Image from "next/image";

interface GaleriItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

export default function KelolaGaleriPage() {
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([
    {
      id: 1,
      title: "Gebrek senen Legian",
      description: "Pementasan rutin setiap Senin Legi di Padepokan.",
      image: "/images/tari-1.jpg",
    },
    {
      id: 2,
      title: "Gebrek senen Legian",
      description: "Pementasan rutin setiap Senin Legi di Padepokan.",
      image: "/images/tari-2.jpg",
    },
  ]);

  const handleTambahFoto = () => {
    alert("Fitur Tambah Foto diklik!");
  };

  const handleEdit = (id: number) => {
    alert(`Edit foto dengan ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    setGaleriList(galeriList.filter((item) => item.id !== id));
  };

  return (
    <div style={{ fontFamily: "var(--font-poppins), sans-serif", color: "#3A2A1A" }}>
      {/* Judul Halaman (Menggunakan Margarine sesuai standar halaman lain) */}
      <h1 
        style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          marginBottom: "20px",
          fontFamily: "var(--font-margarine), cursive, sans-serif"
        }}
      >
        Kelola Galeri
      </h1>

      {/* Tombol Tambah Foto */}
      <button
        type="button"
        onClick={handleTambahFoto}
        style={{
          backgroundColor: "#5C3A21",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          fontFamily: "var(--font-poppins), sans-serif",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tambah Foto
      </button>

      {/* Grid Kartu Galeri */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "24px" 
        }}
      >
        {galeriList.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #8C6D53",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div>
              {/* Gambar / Foto */}
              <div 
                style={{ 
                  position: "relative", 
                  width: "100%", 
                  height: "200px", 
                  borderRadius: "12px", 
                  overflow: "hidden",
                  marginBottom: "16px",
                  backgroundColor: "#EFE8DC" 
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>

              {/* Judul Kartu (Menggunakan Font Poppins, Ketebalan Bold) */}
              <h3 
                style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold", 
                  marginBottom: "8px",
                  fontFamily: "var(--font-poppins), sans-serif",
                  color: "#3A2A1A"
                }}
              >
                {item.title}
              </h3>

              {/* Keterangan (Menggunakan Font Poppins)[cite: 10] */}
              <p 
                style={{ 
                  fontSize: "13px", 
                  color: "#6B5B4F", 
                  marginBottom: "20px",
                  lineHeight: "1.4",
                  fontFamily: "var(--font-poppins), sans-serif"
                }}
              >
                {item.description}
              </p>
            </div>

            {/* Tombol Aksi (Edit & Hapus dengan Font Poppins)[cite: 10] */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handleEdit(item.id)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #8C6D53",
                  backgroundColor: "#FFFFFF",
                  color: "#3A2A1A",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#FF6B6B",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}