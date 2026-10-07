"use client";
import { useState } from "react";

interface LayananItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

export default function KelolaLayananPage() {
  const [layananList] = useState<LayananItem[]>([
    {
      id: "1",
      name: "Panggilan Tari",
      price: "Menyesuaikan",
      description: "Sanggar Asmorobangun menerima panggilan pentas...."
    },
    {
      id: "2",
      name: "Kunjungan Edukasi...",
      price: "Rp 10.000/orang",
      description: "Program ini dirancang untuk kelompok pelajar, mahasiswa...."
    },
    {
      id: "3",
      name: "Kelas Tari...",
      price: "Rp 15.000/kunjungan",
      description: "Kelas ini ditujukan bagi wisatawan atau siapa pun yang...."
    },
    {
      id: "4",
      name: "Les Tari Reguler...",
      price: "Rp XX.000/bulan",
      description: "Program pendaftaran menetap untuk anak-anak, remaja, hingga..."
    },
    {
      id: "5",
      name: "Les Karawitan (Bulanan)",
      price: "Rp XX.000/bulan",
      description: "Karawitan adalah jantung dari setiap pertunjukan Wayang Topeng..."
    },
    {
      id: "6",
      name: "Sewa Kostum",
      price: "Perharinya mulai dari Rp 75.000/set",
      description: "Sanggar menyediakan sewa kostum tari topeng Malangan lengkap...."
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
          marginBottom: "24px", 
          fontFamily: "'Margarine', cursive, sans-serif" 
        }}
      >
        Kelola Layanan
      </h1>

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
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>NAMA</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>HARGA</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>DESKRIPSI</th>
                <th style={{ padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {layananList.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", fontWeight: "600", color: "#3A2A1A", verticalAlign: "middle" }}>{row.name}</td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.price}</td>
                  <td style={{ padding: "16px 20px", color: "#6A5A4A", maxWidth: "350px", verticalAlign: "middle", lineHeight: "1.5" }}>{row.description}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                      {/* Tombol Ikon Lingkaran (Detail) */}
                      <button 
                        type="button"
                        title="Detail" 
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
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>

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