"use client";
import { useState } from "react";
import { formatRupiah, truncate } from "@/lib/format";

interface Topeng {
  id: string;
  name: string;
  character: string;
  price: number;
  image: string;
  desc: string;
}

export default function KelolaTopengPage() {
  const [topengList] = useState<Topeng[]>([
    {
      id: "1",
      name: "Topeng Panji",
      character: "Tokoh utama, watak lembut & bijaksana",
      price: 350000,
      image: "",
      desc: ""
    }
  ]);

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      {/* Judul Halaman dengan Font Margarine */}
      <h1 
        style={{ 
          fontSize: "32px", 
          fontWeight: "normal", 
          color: "#3A2A1A", 
          marginBottom: "16px", 
          fontFamily: "'Margarine', cursive, sans-serif" 
        }}
      >
        Kelola Topeng
      </h1>

      {/* Tombol Tambah Topeng */}
      <div style={{ marginBottom: "20px" }}>
        <button 
          type="button"
          style={{ 
            backgroundColor: "#5A3E2B", 
            color: "#FFFFFF", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "8px", 
            fontSize: "14px", 
            fontWeight: "600", 
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tambah topeng
        </button>
      </div>

      {/* Kotak Tabel dengan Warna FDFCEA Persis Figma */}
      <div 
        style={{ 
          backgroundColor: "#FDFCEA", 
          border: "1.5px solid #D4BBA5", 
          borderRadius: "12px", 
          overflow: "hidden" 
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #D4BBA5", color: "#3A2A1A" }}>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>Gambar</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>Nama</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>Karakter</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>Harga</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {topengList.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <div style={{ width: "40px", height: "40px", backgroundColor: "#EADCCB", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#7A6A5A", fontSize: "12px" }}>
                      -
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <strong style={{ color: "#3A2A1A", display: "block" }}>{row.name}</strong>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#7A6A5A", verticalAlign: "middle", maxWidth: "300px" }}>
                    {truncate(row.character, 50)}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{formatRupiah(row.price)}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                      {/* Tombol Edit */}
                      <button 
                        type="button"
                        style={{ 
                          backgroundColor: "#E6DCC9", 
                          color: "#3A2A1A", 
                          border: "1px solid #C4A482", 
                          padding: "6px 14px", 
                          borderRadius: "6px", 
                          fontSize: "13px", 
                          fontWeight: "500", 
                          cursor: "pointer" 
                        }}
                      >
                        Edit
                      </button>
                      {/* Tombol Hapus */}
                      <button 
                        type="button"
                        style={{ 
                          backgroundColor: "#A84C4C", 
                          color: "#FFFFFF", 
                          border: "none", 
                          padding: "6px 14px", 
                          borderRadius: "6px", 
                          fontSize: "13px", 
                          fontWeight: "500", 
                          cursor: "pointer" 
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}