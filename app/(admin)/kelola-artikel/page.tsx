"use client";
import { useState } from "react";
import { truncate } from "@/lib/format";

interface Artikel {
  id: string;
  title: string;
  category: string;
  date: string;
  content: string;
}

export default function KelolaArtikelPage() {
  const [artikelList] = useState<Artikel[]>([
    {
      id: "1",
      title: "Tantangan Regenerasi: Menjaga Tangan-Tangan Pengukir Topeng Malangan",
      category: "Budaya",
      date: "3 Februari 2026",
      content: ""
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
        Kelola Artikel
      </h1>

      {/* Tombol Tulis Artikel */}
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
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tulis Artikel
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
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>JUDUL</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>KATEGORI</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>TANGGAL</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {artikelList.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", color: "#3A2A1A", verticalAlign: "middle", maxWidth: "380px", lineHeight: "1.5" }}>
                    {truncate(row.title, 80)}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.category}</td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.date}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                      {/* Tombol Ikon Lingkaran (Edit) */}
                      <button 
                        type="button"
                        title="Edit"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%", 
                          border: "1px solid #C4A482", 
                          background: "transparent", 
                          cursor: "pointer", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: "#3A2A1A" 
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      {/* Tombol Ikon Lingkaran (Hapus) */}
                      <button 
                        type="button"
                        title="Hapus"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%", 
                          border: "1px solid #C4A482", 
                          background: "transparent", 
                          cursor: "pointer", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: "#3A2A1A" 
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
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