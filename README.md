# Asmorobangun Admin

Dashboard admin Sanggar Asmorobangun (Next.js). Terhubung ke backend Express + MySQL.

## Menjalankan
1. Nyalakan MySQL (XAMPP) dan backend (`npm start` di folder backend, port 4000).
2. Buat file `.env.local` berisi:
   NEXT_PUBLIC_API_BASE=http://localhost:4000/api
3. Jalankan:
   npm install
   npm run dev
4. Buka http://localhost:3000 lalu login sebagai admin.

## Dokumen
- Perencanaan fitur, kepemilikan data, dan matriks RBAC: [docs/PERENCANAAN.md](docs/PERENCANAAN.md)