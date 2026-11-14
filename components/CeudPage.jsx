"use client";

export function TopengForm() {
  return (
    <form className="a-card" style={{ maxWidth: 560, padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Tambah Topeng Baru</h2>

      {/* Field: Nama */}
      <div className="a-field">
        <label htmlFor="name">
          Nama topeng <span style={{ color: "#c0392b" }}>*</span>
        </label>
        <input id="name" name="name" type="text" placeholder="mis. Topeng Panji" />
      </div>

      {/* Field: Karakter */}
      <div className="a-field">
        <label htmlFor="character">Karakter</label>
        <input
          id="character"
          name="character"
          type="text"
          placeholder="mis. Tokoh utama, watak lembut & bijaksana"
        />
      </div>

      {/* Field: Harga */}
      <div className="a-field">
        <label htmlFor="price">
          Harga (Rp) <span style={{ color: "#c0392b" }}>*</span>
        </label>
        <input id="price" name="price" type="number" min="1" placeholder="350000" />
      </div>

      {/* Field: Stok */}
      <div className="a-field">
        <label htmlFor="stock">Stok</label>
        <input id="stock" name="stock" type="number" min="0" defaultValue="0" />
      </div>

      {/* Field: Warna */}
      <div className="a-field">
        <label htmlFor="color">Warna</label>
        <input id="color" name="color" type="text" placeholder="mis. Putih" />
      </div>

      {/* Field: Deskripsi */}
      <div className="a-field">
        <label htmlFor="desc">Deskripsi</label>
        <textarea id="desc" name="desc" rows={3} />
      </div>

      {/* Gambar: belum dibuat. Backend memakai gambar bawaan kalau kosong */}
      <input type="hidden" name="image" value="" />

      {/* Tombol Simpan */}
      <button type="submit" className="a-btn a-btn-primary" style={{ width: "100%" }}>
        Simpan Topeng
      </button>
    </form>
  );
}