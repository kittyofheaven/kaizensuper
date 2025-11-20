# 🧑‍💼 Admin Dashboard Frontend Guide

> Panduan membangun frontend **admin dashboard** untuk Kaizen (manajemen user & booking fasilitas) dan mapping ke API backend.

---

## 1. Prasyarat & Pola Umum

- Base URL backend: `http://localhost:3000`
- Prefix API: `/api/v1`
- Hampir semua endpoint (kecuali `/health`, `/api/v1`, dan `/api/v1/auth/*`) **wajib** pakai header:
  - `Authorization: Bearer <token>`
- Alur login:
  - `POST /api/v1/auth/login` → ambil `data.token` → simpan (mis. `localStorage`) → pakai di semua request berikutnya.
- Format response & error detail: lihat `API_DOCUMENTATION.md`.

Contoh helper pemanggilan API di frontend:

```ts
const BASE_URL = "http://localhost:3000/api/v1";

async function apiCall(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    throw new Error("Token expired/invalid");
  }

  return res.json();
}
```

> Di seluruh dokumen ini, path seperti `/users` berarti `${BASE_URL}/users` (jadi full URL-nya `http://localhost:3000/api/v1/users`).

---

## 2. Halaman Auth & Session Admin

### 2.1. Konsep Admin di Backend

- Di tabel `Users` ada kolom enum internal:
  - `accessLevel` dengan nilai: `REGULAR` atau `ADMIN`.
- Field ini **tidak pernah dikirim ke frontend**:
  - Response `login`, `profile`, `users` sudah di‑filter (hanya kirim `gender`, `angkatan`, dsb).
- Backend menentukan admin lewat:
  - Middleware `AdminMiddleware.requireAdmin` (cek `accessLevel === 'ADMIN'` di DB).
  - Util `AccessControlUtil.isAdmin(userId)` untuk logic delete booking.

Konsekuensi untuk FE:

- Frontend tidak bisa langsung baca `role` dari payload user.
- Cara aman untuk tahu “akun ini admin atau bukan”:
  - Coba panggil endpoint admin‑only (mis. `GET /users`).
  - Kalau `200` → admin.
  - Kalau `403` → bukan admin.

Contoh helper deteksi admin:

```ts
async function checkIsAdmin(): Promise<boolean> {
  try {
    const res = await apiCall("/users?page=1&limit=1");
    return res.success === true;
  } catch (e: any) {
    // Jika backend balas 403, berarti bukan admin
    if (e?.status === 403) return false;
    return false;
  }
}
```

**Fitur admin**

- Login sebagai admin.
- Lihat profil akun yang sedang login.
- Ganti password.
- Logout.
 - Membuat user baru via `/auth/register`.

**API & langkah frontend**

1. **Login**
   - Endpoint: `POST /auth/login`
   - Body:
     ```json
     { "nomorWa": "+628....", "password": "..." }
     ```
   - Frontend:
     - Kirim form login ke `/auth/login`.
     - Jika `success === true`, simpan `data.token` ke `localStorage` (mis. key `authToken`) dan simpan info user (`data.user`) di state (context/Redux).
     - Redirect ke `/admin`.

2. **Get profil saat load dashboard**
   - Endpoint: `GET /auth/profile`
   - Dipanggil di layout admin ketika app mount.
   - Jika gagal dengan 401 → hapus token, redirect ke `/login`.

3. **Ganti password**
   - Endpoint: `PUT /auth/update-password`
   - Body:
     ```json
     { "currentPassword": "lama", "newPassword": "baru123" }
     ```
   - UI: form sederhana di halaman "Account Settings" admin.

4. **Logout**
   - Endpoint: `POST /auth/logout` (opsional, hanya untuk konfirmasi).
   - Frontend:
     - Panggil endpoint.
     - Hapus token dari storage.
     - Redirect ke `/login`.

5. **Cek apakah user ini admin (untuk web admin baru)**
   - Di layout admin (mis. `/admin`), setelah login:
     - Panggil `GET /auth/profile` untuk ambil info user.
     - Panggil `GET /users?page=1&limit=1`.
       - Jika response `200` → izinkan akses halaman admin.
       - Jika response `403` → redirect ke halaman user biasa (atau tampilkan “Access denied”).

> Saran arsitektur: buat aplikasi admin sebagai web terpisah (mis. path `/admin/*`). Setelah login, aplikasi admin mem‑probe `/users` seperti di atas untuk memastikan hanya akun dengan `accessLevel = ADMIN` yang bisa mengakses dashboard admin.

---

## 3. Halaman Manajemen User

**Yang bisa dilakukan admin**

- Melihat daftar semua user.
- Melihat detail user tertentu.
- Mencari user berdasarkan nomor WhatsApp.
- Memfilter user berdasarkan angkatan.
- Mengedit data user (nama, nomor WA, angkatan, gender).
- Menghapus user.

> Pembuatan user baru via FE **hanya admin**: `POST /api/v1/auth/register` sudah aktif kembali tetapi diproteksi `AdminMiddleware.requireAdmin`. Endpoint `POST /api/v1/users` tetap tidak dipakai untuk create user.

**API & langkah frontend**

1. **List user (tabel utama)**
   - Endpoint: `GET /users?page={page}&limit={limit}&sortBy=namaLengkap&sortOrder=asc`
   - Gunakan:
     - `result.data` → isi tabel.
     - `result.pagination` → komponen pagination (page, total, totalPages).

2. **Detail user**
   - Endpoint: `GET /users/{id}`
   - Dipanggil saat admin klik baris / tombol "Detail".

3. **Filter per angkatan**
   - Endpoint: `GET /users/angkatan/{angkatanId}`
   - UI: dropdown angkatan → ketika berubah, panggil endpoint ini dan tampilkan hasil di tabel.

4. **Cari user by nomor WhatsApp**
   - Endpoint: `GET /users/wa/{nomorWa}`
   - UI: input search → ketika submit, panggil endpoint ini dan tampilkan 1 hasil (atau error jika 404).

5. **Update data user**
   - Endpoint: `PUT /users/{id}`
   - Body: subset field yang boleh diedit, contoh:
     ```json
     {
       "namaLengkap": "Nama Baru",
       "namaPanggilan": "Panggilan",
       "nomorWa": "+628...",
       "idAngkatan": "1"
     }
     ```
   - UI: form edit → saat submit:
     - Panggil `PUT /users/{id}`.
     - Jika sukses, refresh detail/list.

6. **Hapus user**
   - Endpoint: `DELETE /users/{id}`
   - UI: tombol "Delete" dengan konfirmasi → setelah sukses, reload list user.

---

## 4. Halaman Ringkasan Dashboard

**Yang bisa dilakukan admin**

- Melihat jumlah total user.
- Melihat jumlah booking per fasilitas (hari ini / rentang tanggal).
- Melihat daftar booking terbaru.

**API & langkah frontend**

- **Total user**
  - Endpoint: `GET /users?page=1&limit=1`
  - Gunakan `result.pagination.total` sebagai total user.

- **Booking terbaru per fasilitas**
  - Communal: `GET /communal?page=1&limit=10&sortBy=waktuMulai&sortOrder=desc`
  - Serbaguna: `GET /serbaguna?page=1&limit=10&sortBy=waktuMulai&sortOrder=desc`
  - CWS: `GET /cws?page=1&limit=10`
  - Theater: `GET /theater?page=1&limit=10&sortBy=waktuMulai&sortOrder=desc`
  - Dapur: `GET /dapur?page=1&limit=10&sortBy=waktuMulai&sortOrder=desc`
  - Mesin cuci cewe/cowo: `GET /mesin-cuci-cewe?page=1&limit=10`, `GET /mesin-cuci-cowo?page=1&limit=10`

- **Booking per hari tertentu (untuk kartu "Today")**
  - CWS (punya endpoint khusus tanggal):
    - `GET /cws/date/{YYYY-MM-DD}`
  - Dapur:
    - `GET /dapur/time-range?startTime=...&endTime=...`
  - Mesin cuci cewe/cowo:
    - `GET /mesin-cuci-cewe/time-range?startTime=...&endTime=...`
    - `GET /mesin-cuci-cowo/time-range?startTime=...&endTime=...`
  - Modul lain (communal, serbaguna, theater) bisa difilter di frontend berdasarkan `waktuMulai`.

---

## 5. Manajemen Booking Fasilitas – Pola Umum

**Pola alur UI yang sama untuk semua modul booking:**

1. Admin pilih user (penanggung jawab/peminjam)  
   → ambil dari tabel `Users` atau search WA.
2. Admin pilih fasilitas + tanggal.
3. Frontend panggil endpoint `time-slots` / `available-slots` untuk tanggal + fasilitas tersebut.
4. Admin pilih salah satu slot yang `available === true`.
5. Frontend kirim `POST` untuk membuat booking.
6. Untuk edit/hapus:
   - `PUT /{module}/{id}` untuk update.
   - `DELETE /{module}/{id}` untuk cancel booking.

---

## 6. Mapping API per Modul Fasilitas

### 6.1. Communal

**Fitur admin**

- Melihat semua booking communal (dengan filter lantai/penanggung jawab).
- Melihat ketersediaan slot waktu per lantai.
- Membuat booking baru.
- Mengubah booking (jam, jumlah orang, keterangan, status `isDone`).
- Menghapus booking.

**Endpoint utama**

- List booking: `GET /communal`
- Detail booking: `GET /communal/{id}`
- Booking per penanggung jawab: `GET /communal/penanggung-jawab/{penanggungJawabId}`
- Booking per lantai: `GET /communal/lantai/{lantai}`
- Saran slot (tanpa info occupied): `GET /communal/time-slots?date=YYYY-MM-DD`
- Slot tersedia (dengan flag `available`): `GET /communal/available-slots/{date}/{lantai}`
- Create booking: `POST /communal`
  - Body contoh:
    ```json
    {
      "idPenanggungJawab": "1",
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "jumlahPengguna": "5",
      "lantai": "2",
      "keterangan": "Meeting rutin"
    }
    ```
- Update booking: `PUT /communal/{id}`
- Delete booking: `DELETE /communal/{id}`

**Catatan UI**

- Slot selalu 1 jam penuh; builder slot di UI sebaiknya pakai respons `available-slots` agar tidak perlu manual validasi jam.

---

### 6.2. Serbaguna

**Fitur admin**

- Melihat semua booking serbaguna.
- Melihat daftar area serbaguna.
- Melihat slot waktu yang tersedia per area.
- Membuat, mengubah, menghapus booking serbaguna.

**Endpoint utama**

- List booking: `GET /serbaguna`
- Detail booking: `GET /serbaguna/{id}`
- List area: `GET /serbaguna/areas`
- Booking per penanggung jawab: `GET /serbaguna/penanggung-jawab/{penanggungJawabId}`
- Booking per area: `GET /serbaguna/area/{areaId}`
- Saran slot: `GET /serbaguna/time-slots?date=YYYY-MM-DD`
- Slot tersedia: `GET /serbaguna/available-slots/{date}/{areaId}`
- Create booking: `POST /serbaguna`
- Update booking: `PUT /serbaguna/{id}`
- Delete booking: `DELETE /serbaguna/{id}`

**Catatan UI**

- Form create sebaiknya menyediakan:
  - Dropdown penanggung jawab (data dari `/users`).
  - Dropdown area (data dari `/serbaguna/areas`).
  - Date picker + dropdown slot (data dari `/serbaguna/available-slots/{date}/{areaId}`).

---

### 6.3. CWS (Community Work Space)

**Fitur admin**

- Melihat semua booking CWS.
- Melihat jadwal CWS per tanggal (daily view).
- Melihat slot waktu tersedia (2 jam).
- Membuat/ubah/hapus booking CWS.
- Menandai semua booking yang sudah lewat sebagai `done`.

**Endpoint utama**

- List booking: `GET /cws`
- Detail booking: `GET /cws/{id}`
- Booking per tanggal: `GET /cws/date/{YYYY-MM-DD}`
- Booking per penanggung jawab: `GET /cws/penanggung-jawab/{penanggungJawabId}`
- Slot tersedia (cek availability): `GET /cws/time-slots?date=YYYY-MM-DD`
- Saran slot (tanpa cek availability): `GET /cws/time-suggestions?date=YYYY-MM-DD`
- Create booking: `POST /cws`
- Update booking: `PUT /cws/{id}`
- Delete booking: `DELETE /cws/{id}`
- Mark semua booking yang sudah lewat menjadi `done`: `POST /cws/mark-past-done`

**Catatan UI**

- Slot selalu 2 jam (mis. 14:00–16:00); di UI, pilihan slot sebaiknya langsung pakai data dari `time-slots`.
- Tambahkan tombol khusus di halaman CWS seperti:
  - "Mark all past bookings as done" → panggil `POST /cws/mark-past-done` lalu refresh list.

---

### 6.4. Theater

**Fitur admin**

- Melihat semua booking theater.
- Melihat slot waktu tersedia per tanggal.
- Membuat/ubah/hapus booking theater.

**Endpoint utama**

- List booking: `GET /theater`
- Detail booking: `GET /theater/{id}`
- Booking per penanggung jawab: `GET /theater/penanggung-jawab/{penanggungJawabId}`
- Slot tersedia (cek availability): `GET /theater/time-slots?date=YYYY-MM-DD`
- Saran slot: `GET /theater/time-suggestions?date=YYYY-MM-DD`
- Create booking: `POST /theater`
- Update booking: `PUT /theater/{id}`
- Delete booking: `DELETE /theater/{id}`

---

### 6.5. Dapur

**Fitur admin**

- Melihat semua booking dapur.
- Melihat daftar fasilitas dapur (kompor, microwave, dll.).
- Melihat slot waktu tersedia per fasilitas.
- Membuat/ubah/hapus booking dapur.

**Endpoint utama**

- List booking: `GET /dapur`
- Detail booking: `GET /dapur/{id}`
- List fasilitas dapur: `GET /dapur/facilities`
- Booking per peminjam: `GET /dapur/peminjam/{peminjamId}`
- Booking per fasilitas: `GET /dapur/fasilitas/{fasilitasId}`
- Slot tersedia: `GET /dapur/time-slots?date=YYYY-MM-DD&facilityId={idFasilitas}`
- Booking per rentang waktu (untuk laporan): `GET /dapur/time-range?startTime=...&endTime=...`
- Create booking: `POST /dapur`
- Update booking: `PUT /dapur/{id}`
- Delete booking: `DELETE /dapur/{id}`

**Catatan UI**

- Field `pinjamPeralatan` (boolean) bisa ditampilkan sebagai checkbox "Pinjam peralatan dapur".

---

### 6.6. Mesin Cuci Cewe & Cowo

**Fitur admin**

- Melihat semua booking mesin cuci cewe/cowo.
- Melihat daftar mesin cuci yang tersedia.
- Melihat slot waktu tersedia per mesin.
- Membuat/ubah/hapus booking mesin cuci.

**Endpoint utama (struktur sama untuk cewe & cowo)**

Ganti `{genderPath}` dengan:

- `mesin-cuci-cewe`
- `mesin-cuci-cowo`

Endpoint:

- List booking: `GET /{genderPath}`
- Detail booking: `GET /{genderPath}/{id}`
- List fasilitas: `GET /{genderPath}/facilities`
- Booking per peminjam: `GET /{genderPath}/peminjam/{peminjamId}`
- Booking per fasilitas: `GET /{genderPath}/fasilitas/{fasilitasId}`
- Slot tersedia: `GET /{genderPath}/time-slots?date=YYYY-MM-DD&facilityId={idFasilitas}`
- Booking per rentang waktu (untuk laporan): `GET /{genderPath}/time-range?startTime=...&endTime=...`
- Create booking: `POST /{genderPath}`
- Update booking: `PUT /{genderPath}/{id}`
- Delete booking: `DELETE /{genderPath}/{id}`

**Catatan UI**

- Sama seperti dapur: pilih user peminjam, pilih mesin (dari `/facilities`), lalu pilih slot (dari `/time-slots`).

---

## 7. Rekomendasi Struktur UI Admin

Contoh struktur route frontend:

- `/admin/login` – halaman login admin (pakai `POST /auth/login`).
- `/admin` – dashboard ringkasan (total user, total booking per fasilitas hari ini).
- `/admin/users` – tabel user + filter & search.
- `/admin/users/:id` – detail & edit user.
- `/admin/bookings/communal` – manajemen booking communal.
- `/admin/bookings/serbaguna`
- `/admin/bookings/cws`
- `/admin/bookings/theater`
- `/admin/bookings/dapur`
- `/admin/bookings/mesin-cuci-cewe`
- `/admin/bookings/mesin-cuci-cowo`
- `/admin/settings/account` – ganti password, info akun.

Dengan mapping endpoint di atas, frontend bisa mengimplementasikan semua hal yang biasanya dilakukan admin (manage user dan seluruh booking fasilitas) tanpa perlu mengubah backend.  
Selain itu, dengan adanya kolom `accessLevel` di backend:

- Aplikasi **user biasa** (non-admin) bisa tetap memakai endpoint booking yang sama tanpa tahu soal role.
- Aplikasi **admin** cukup:
  - Login dengan akun admin,
  - Probe `/users` untuk verifikasi hak akses,
  - Lalu gunakan semua endpoint dalam dokumen ini untuk membangun web admin terpisah (manajemen user + seluruh booking).
