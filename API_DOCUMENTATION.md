# 🚀 Kaizen API Documentation - Frontend Developer Guide

> **Comprehensive guide untuk integrasi Kaizen API dengan frontend application**

## 📋 Daftar Isi

- [🚀 Quick Start Guide](#-quick-start-guide)
- [🌐 Base URL & Authentication](#-base-url--authentication)
- [📤 Format Response](#-format-response)
- [❌ Error Handling](#-error-handling)
- [🚨 Common Errors & Solutions](#-common-errors--solutions)
- [📄 Pagination](#-pagination)
- [🔗 Endpoints](#-endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication)
  - [Users Management](#users-management)
  - [Communal Room Booking](#communal-room-booking)
  - [Serbaguna Area Booking](#serbaguna-area-booking)
  - [Kitchen Booking](#kitchen-booking)
  - [Women's Washing Machine Booking](#womens-washing-machine-booking)
  - [Men's Washing Machine Booking](#mens-washing-machine-booking)
  - [Theater Booking](#theater-1-hour-slots--new)
- [⏰ Validasi Waktu](#-validasi-waktu)
- [💡 Contoh Penggunaan](#-contoh-penggunaan)
- [🔧 Tips untuk Frontend Developer](#-tips-untuk-frontend-developer)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🐳 Docker Setup](#-docker-setup)

---

## 🚀 Quick Start Guide

### 📋 Prerequisites

- **Server URL**: `http://localhost:3000`
- **API Version**: `v1` (prefix: `/api/v1`)
- **Content-Type**: `application/json` untuk semua POST/PUT requests
- **Authentication**: JWT Bearer Token (required untuk semua endpoints kecuali login)

### 🔐 Authentication Flow - Step by Step

#### **Step 1: Login untuk Mendapatkan Token**

```javascript
// 1. Login dengan credentials
const loginResponse = await fetch("http://localhost:3000/api/v1/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    nomorWa: "+6285790826168", // Test user: Hazel
    password: "12345678", // Test password
  }),
});

const loginData = await loginResponse.json();

if (loginData.success) {
  // 2. Simpan token untuk request selanjutnya
  const token = loginData.data.token;
  localStorage.setItem("authToken", token);

  console.log("✅ Login berhasil!");
  console.log("User:", loginData.data.user);
  console.log("Token expires in:", loginData.data.expiresIn); // "1h"
} else {
  console.error("❌ Login gagal:", loginData.message);
}
```

#### **Step 2: Gunakan Token untuk Request API**

```javascript
// 3. Ambil token dari storage
const token = localStorage.getItem("authToken");

// 4. Gunakan token untuk request protected endpoints
const response = await fetch("http://localhost:3000/api/v1/users", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// 5. Handle response
if (response.status === 401) {
  console.error("🔒 Token expired atau invalid. Silakan login ulang.");
  localStorage.removeItem("authToken");
  // Redirect ke halaman login
  return;
}

const data = await response.json();
console.log("📊 Data users:", data);
```

#### **Step 3: Handle Token Expiration**

```javascript
// Helper function untuk handle API calls dengan auto-refresh
async function apiCall(url, options = {}) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No token found. Please login first.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/login"; // Redirect to login
    throw new Error("Token expired. Please login again.");
  }

  return response.json();
}

// Usage
try {
  const users = await apiCall("http://localhost:3000/api/v1/users");
  console.log("Users:", users.data);
} catch (error) {
  console.error("API Error:", error.message);
}
```

### 🧪 Test Credentials

**Available Test Users:**

| Nama      | Nomor WA         | Password      |
| --------- | ---------------- | ------------- |
| Test User | `+6281234567890` | `password123` |
| Hazel     | `+6285790826168` | `12345678`    |

### ⚡ Quick Test

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nomorWa": "+6285790826168", "password": "12345678"}'

# Test protected endpoint (replace TOKEN with actual token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/users
```

---

## 🐳 Docker Setup

### 1. Build Image (Arch Linux & other distros)

```bash
docker build -t kaizen-api .
```

- Gunakan `--platform linux/amd64` bila diperlukan (misal build di Apple Silicon untuk server x86_64 Arch).

### 2. Jalankan Container

```bash
docker run --rm \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:3306/database" \
  kaizen-api
```

- `DATABASE_URL` wajib diisi agar Prisma dapat terhubung ke database.
- Tambahkan environment lain (`JWT_SECRET`, `JWT_EXPIRES_IN`, dsb.) dengan `-e` sesuai kebutuhan.
- Untuk development lokal, koneksikan ke database di host dengan `host.docker.internal` (Docker Desktop) atau `--network host` (pada Arch Linux dengan Docker default).

### 3. Docker Compose (opsional)

Buat file `docker-compose.yml` sederhana jika ingin menyatukan aplikasi dan database:

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://user:password@mysql:3306/database
      JWT_SECRET: super-secret
    depends_on:
      - mysql
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: database
    ports:
      - "3306:3306"
```

Jalankan dengan:

```bash
docker compose up --build
```

---

## 📝 Informasi Umum

**Kaizen API** adalah sistem booking fasilitas yang memungkinkan pengguna untuk melakukan reservasi berbagai fasilitas seperti ruang komunal, area serbaguna, dapur, dan mesin cuci.

### Teknologi Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **Documentation**: Swagger/OpenAPI 3.0

### Fitur Utama

- ✅ Manajemen pengguna
- 🏢 Booking ruang komunal
- 🎯 Booking area serbaguna
- 🍳 Booking fasilitas dapur
- 👕 Booking mesin cuci (terpisah untuk pria dan wanita)
- ⏰ Validasi slot waktu otomatis
- 📄 Pagination untuk semua list data
- 🔍 Filter berdasarkan berbagai kriteria

---

## 🌐 Base URL & Authentication

### Base URL

```
http://localhost:3000
```

### API Version

Semua endpoint menggunakan prefix:

```
/api/v1
```

### Authentication

**API menggunakan JWT (JSON Web Token) untuk authentication dengan keamanan maksimal.**

- **Token Type**: Bearer Token
- **Expires**: 1 jam setelah login
- **Header Format**: `Authorization: Bearer <your_jwt_token>`
- **Security**: JWT hanya berisi User ID (tidak ada data personal)

**Protected Endpoints**: Semua endpoint kecuali `/auth/*` membutuhkan JWT token.

**Public Endpoints**:

- `/health` - Health check
- `/api/v1` - API info
- `/api/v1/auth/*` - Authentication endpoints

**🔒 Security Features:**

- ✅ **Minimal JWT Payload** - Hanya berisi User ID
- ✅ **No Personal Data** - Nama, nomor HP tidak ada di token
- ✅ **Privacy Protected** - Data personal tidak terekspos
- ✅ **Fresh Data** - User details selalu diambil dari database

**🔑 JWT Token Structure:**

```json
{
  "sub": "1", // User ID (Subject)
  "iat": 1757644130, // Issued At timestamp
  "exp": 1757647730 // Expires At timestamp
}
```

**Note**: JWT hanya berisi User ID. Data user lainnya (nama, email, dll) diambil dari database saat dibutuhkan untuk memastikan data selalu up-to-date dan privacy terjaga.

### Swagger Documentation

Dokumentasi interaktif tersedia di:

```
http://localhost:3000/api/docs
```

---

## 📤 Format Response

### Success Response

```json
{
  "success": true,
  "data": {}, // atau []
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detail error 1", "Detail error 2"] // optional
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "message": "Data retrieved successfully"
}
```

---

## ❌ Error Handling

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Token missing/invalid/expired)
- `403` - Forbidden (Access denied)
- `404` - Not Found
- `409` - Conflict (Duplicate booking/resource)
- `422` - Unprocessable Entity (Validation failed)
- `500` - Internal Server Error

### Common Error Messages

```json
{
  "success": false,
  "message": "Waktu booking harus dalam slot 1 jam penuh (contoh: 13:00-14:00)"
}
```

```json
{
  "success": false,
  "message": "Waktu booking tidak boleh di masa lalu"
}
```

```json
{
  "success": false,
  "message": "Resource not found"
}
```

```json
{
  "success": false,
  "message": "Token expired or invalid"
}
```

---

## 🚨 Common Errors & Solutions

### 🔐 Authentication Errors

#### **Error 1: "Authorization header missing"**

```json
{
  "success": false,
  "message": "Authorization header missing"
}
```

**❌ Problem:** Tidak mengirim Authorization header pada protected endpoints.

**✅ Solution:**

```javascript
// WRONG ❌
const response = await fetch("/api/v1/users");

// CORRECT ✅
const token = localStorage.getItem("authToken");
const response = await fetch("/api/v1/users", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

#### **Error 2: "Token expired or invalid"**

```json
{
  "success": false,
  "message": "Token expired or invalid"
}
```

**❌ Problem:** Token sudah expired (lebih dari 1 jam) atau format salah.

**✅ Solution:**

```javascript
// Check token expiration before making requests
function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Usage
const token = localStorage.getItem("authToken");
if (isTokenExpired(token)) {
  // Redirect to login
  window.location.href = "/login";
} else {
  // Use token for API call
  const response = await fetch("/api/v1/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

#### **Error 3: "Nomor WhatsApp atau password tidak valid"**

```json
{
  "success": false,
  "message": "Nomor WhatsApp atau password tidak valid"
}
```

**❌ Problem:** Credentials salah atau user tidak exist.

**✅ Solution:**

```javascript
// Make sure to use correct format and test credentials
const loginData = {
  nomorWa: "+6285790826168", // Must include country code (+62)
  password: "12345678", // Exact password (case sensitive)
};

const response = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(loginData),
});
```

### 📅 Booking & Validation Errors

#### **Error 4: "Waktu booking harus dalam slot 1 jam penuh"**

```json
{
  "success": false,
  "message": "Waktu booking harus dalam slot 1 jam penuh (contoh: 13:00-14:00)"
}
```

**❌ Problem:** Waktu tidak dalam slot 1 jam atau menit/detik tidak 0.

**✅ Solution:**

```javascript
// WRONG ❌
const waktuMulai = "2024-01-15T13:30:00.000Z"; // 13:30 not allowed
const waktuBerakhir = "2024-01-15T14:30:00.000Z";

// CORRECT ✅
function createBookingTime(date, hour) {
  const bookingDate = new Date(date);
  bookingDate.setHours(hour, 0, 0, 0); // Force minutes/seconds/ms to 0
  return bookingDate.toISOString();
}

const waktuMulai = createBookingTime("2024-01-15", 13); // 13:00:00.000Z
const waktuBerakhir = createBookingTime("2024-01-15", 14); // 14:00:00.000Z
```

#### **Error 5: "Waktu booking tidak boleh di masa lalu"**

```json
{
  "success": false,
  "message": "Waktu booking tidak boleh di masa lalu"
}
```

**❌ Problem:** Mencoba booking untuk waktu yang sudah lewat.

**✅ Solution:**

```javascript
function validateBookingTime(waktuMulai) {
  const bookingTime = new Date(waktuMulai);
  const now = new Date();

  if (bookingTime <= now) {
    throw new Error("Cannot book for past time");
  }

  return true;
}

// Usage
const waktuMulai = "2024-01-15T13:00:00.000Z";
validateBookingTime(waktuMulai);
```

### 🌐 Network & CORS Errors

#### **Error 6: CORS Error**

**❌ Problem:** Frontend tidak bisa akses API karena CORS policy.

**✅ Solution:**

```javascript
// Make sure server is running on correct port
const BASE_URL = "http://localhost:3000";

// For development, you might need to proxy requests
// In React (package.json):
{
  "name": "my-app",
  "proxy": "http://localhost:3000"
}

// Then use relative URLs:
const response = await fetch("/api/v1/users");
```

#### **Error 7: Network Request Failed**

**❌ Problem:** Server tidak running atau URL salah.

**✅ Solution:**

```bash
# Check if server is running
curl http://localhost:3000/health

# Start server if not running
npm run dev
```

### 📊 Data Format Errors

#### **Error 8: "Validation failed"**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["namaLengkap is required", "nomorWa must be a valid phone number"]
}
```

**❌ Problem:** Data tidak sesuai format yang diharapkan.

**✅ Solution:**

```javascript
// Validate data before sending
function validateUserData(userData) {
  const errors = [];

  if (!userData.namaLengkap) errors.push("namaLengkap is required");
  if (!userData.nomorWa) errors.push("nomorWa is required");
  if (userData.nomorWa && !userData.nomorWa.startsWith("+62")) {
    errors.push("nomorWa must start with +62");
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  return true;
}

// Usage
const userData = {
  namaLengkap: "John Doe",
  namaPanggilan: "John",
  nomorWa: "+6281234567890",
};

validateUserData(userData);
```

### 🔄 Response Format Errors

#### **Error 9: Cannot read property of undefined**

**❌ Problem:** Mengakses property yang tidak ada di response.

**✅ Solution:**

```javascript
// WRONG ❌
const response = await fetch("/api/v1/users");
const users = response.data; // response.data might be undefined

// CORRECT ✅
const response = await fetch("/api/v1/users");
const result = await response.json();

if (result.success && result.data) {
  const users = result.data;
  console.log("Users:", users);
} else {
  console.error("Error:", result.message);
}

// Even better with optional chaining
const users = result?.data || [];
const message = result?.message || "Unknown error";
```

---

## 📄 Pagination

### Query Parameters

- `page` (integer, optional): Nomor halaman (default: 1)
- `limit` (integer, optional): Jumlah item per halaman (default: 10, max: 100)
- `sortBy` (string, optional): Field untuk sorting
- `sortOrder` (string, optional): Urutan sorting ("asc" atau "desc", default: "asc")

### Contoh

```
GET /api/v1/users?page=2&limit=20&sortBy=namaLengkap&sortOrder=asc
```

> ℹ️ Mulai versi ini, field `pagination.total` dan `pagination.totalPages` mencerminkan total data sesungguhnya di database, bukan hanya jumlah item pada halaman aktif.

---

## 🔗 Endpoints

### Health Check

#### Get API Health Status

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Get API Information

```http
GET /api/v1
```

**Response:**

```json
{
  "success": true,
  "message": "Kaizen API v1",
  "version": "1.0.0",
  "documentation": "/api/docs",
  "endpoints": {
    "users": "/api/v1/users",
    "communal": "/api/v1/communal",
    "serbaguna": "/api/v1/serbaguna",
    "mesinCuciCewe": "/api/v1/mesin-cuci-cewe",
    "mesinCuciCowo": "/api/v1/mesin-cuci-cowo",
    "dapur": "/api/v1/dapur"
  }
}
```

---

### Authentication

#### User Registration ⚠️ TEMPORARILY DISABLED

```http
POST /api/v1/auth/register (DISABLED)
```

**Status: 🚫 ENDPOINT TEMPORARILY DISABLED**

This endpoint is currently disabled for maintenance purposes. Registration functionality will be re-enabled soon.

**Current Response:**

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Route /api/v1/auth/register not found"
}
```

<!-- DISABLED TEMPORARILY
**Request Body:**

```json
{
  "namaLengkap": "John Doe",
  "namaPanggilan": "John",
  "nomorWa": "+6281234567890",
  "password": "password123",
  "idAngkatan": "1"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "namaLengkap": "John Doe",
      "namaPanggilan": "John",
      "gender": "Male",
      "nomorWa": "+6281234567890",
      "idAngkatan": "1",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "angkatan": {
        "id": "1",
        "namaAngkatan": "Angkatan 2024"
      }
    },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU3NjQ0MTMwLCJleHAiOjE3NTc2NDc3MzB9...",
    "expiresIn": "1h"
  },
  "message": "Registrasi berhasil"
}
```

**Validation Rules:**

- ✅ `namaLengkap`, `namaPanggilan`, `nomorWa`, `password` wajib diisi
- ✅ `password` minimal 6 karakter
- ✅ `nomorWa` harus unik
- ✅ `idAngkatan` opsional, harus exist jika diisi
-->

#### User Login

```http
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "nomorWa": "+6281234567890",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "namaLengkap": "John Doe",
      "namaPanggilan": "John",
      "nomorWa": "+6281234567890",
      "idAngkatan": "1",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "angkatan": {
        "id": "1",
        "namaAngkatan": "Angkatan 2024"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU3NjQ0MTMwLCJleHAiOjE3NTc2NDc3MzB9...",
    "expiresIn": "1h"
  },
  "message": "Login berhasil"
}
```

#### Get User Profile

```http
GET /api/v1/auth/profile
```

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "namaLengkap": "John Doe",
    "namaPanggilan": "John",
    "gender": "Male",
    "nomorWa": "+6281234567890",
    "idAngkatan": "1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "angkatan": {
      "id": "1",
      "namaAngkatan": "Angkatan 2024"
    }
  },
  "message": "Profile berhasil diambil"
}
```

#### Update Password

```http
PUT /api/v1/auth/update-password
```

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Password berhasil diupdate"
}
```

#### Logout

```http
POST /api/v1/auth/logout
```

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Logout berhasil"
}
```

**Note**: Logout adalah client-side action. Server tidak blacklist token, jadi pastikan client menghapus token dari storage.

---

### Users Management

#### Get All Users

```http
GET /api/v1/users
```

**Query Parameters:**

- `page`, `limit`, `sortBy`, `sortOrder` (pagination parameters)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "idAngkatan": "1",
      "namaLengkap": "John Doe",
      "namaPanggilan": "John",
      "nomorWa": "+6281234567890",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "angkatan": {
        "id": "1",
        "namaAngkatan": "Angkatan 2024"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Get User by ID

```http
GET /api/v1/users/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "idAngkatan": "1",
    "namaLengkap": "John Doe",
    "namaPanggilan": "John",
    "nomorWa": "+6281234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "angkatan": {
      "id": "1",
      "namaAngkatan": "Angkatan 2024"
    }
  }
}
```

#### Create New User

```http
POST /api/v1/users
```

**Request Body:**

```json
{
  "idAngkatan": "1",
  "namaLengkap": "Jane Doe",
  "namaPanggilan": "Jane",
  "nomorWa": "+6281234567891"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "2",
    "idAngkatan": "1",
    "namaLengkap": "Jane Doe",
    "namaPanggilan": "Jane",
    "nomorWa": "+6281234567891",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Resource created successfully"
}
```

#### Update User

```http
PUT /api/v1/users/{id}
```

**Request Body:**

```json
{
  "namaLengkap": "Jane Smith",
  "nomorWa": "+6281234567892"
}
```

#### Delete User

```http
DELETE /api/v1/users/{id}
```

#### Get Users by Angkatan

```http
GET /api/v1/users/angkatan/{angkatanId}
```

#### Get User by WhatsApp Number

```http
GET /api/v1/users/wa/{nomorWa}
```

---

### Communal Room Booking

#### Get All Communal Bookings

```http
GET /api/v1/communal
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "idPenanggungJawab": "1",
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "jumlahPengguna": "5",
      "lantai": "2",
      "keterangan": "Meeting rutin mingguan",
      "isDone": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "penanggungJawab": {
        "id": "1",
        "namaLengkap": "John Doe",
        "namaPanggilan": "John",
        "nomorWa": "+6281234567890"
      }
    }
  ]
}
```

#### Create Communal Booking

```http
POST /api/v1/communal
```

**Request Body:**

```json
{
  "idPenanggungJawab": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z",
  "jumlahPengguna": "5",
  "lantai": "2",
  "keterangan": "Meeting rutin mingguan",
  "isDone": false
}
```

**Validasi:**

- ✅ Waktu harus dalam slot 1 jam penuh (contoh: 13:00-14:00)
- ✅ Waktu tidak boleh di masa lalu
- ✅ Penanggung jawab harus exist di database
- ✅ Ruang tidak boleh double booking

#### Update Communal Booking

```http
PUT /api/v1/communal/{id}
```

**Catatan:** Perubahan salah satu dari `waktuMulai` atau `waktuBerakhir` tetap melewati validasi slot 1 jam, pengecekan waktu masa depan, dan deteksi bentrok pada lantai terkait.

#### Delete Communal Booking

```http
DELETE /api/v1/communal/{id}
```

#### Get Communal by Responsible Person

```http
GET /api/v1/communal/penanggung-jawab/{penanggungJawabId}
```

#### Get Communal by Floor

```http
GET /api/v1/communal/lantai/{lantai}
```

#### Get Available Time Slots

```http
GET /api/v1/communal/available-slots/{date}/{lantai}
```

**Example:**

```http
GET /api/v1/communal/available-slots/2024-01-15/2
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T07:00:00.000Z",
      "display": "13.00 - 14.00",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "display": "20.00 - 21.00",
      "available": false
    }
  ]
}
```

#### Get Time Slot Suggestions ⭐ **IMPROVED**

```http
GET /api/v1/communal/time-slots?date=2024-01-15
```

**✨ NEW FEATURES:**

- **Smart Availability**: Slot yang sudah dibooking ditandai `available: false`
- **User-Friendly Display**: Format waktu Indonesia `"13.00 - 14.00"`
- **Real-time Data**: Selalu menampilkan data availability terkini

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T07:00:00.000Z",
      "display": "13.00 - 14.00",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "display": "20.00 - 21.00",
      "available": false
    }
  ]
}
```

**💡 Frontend Tips:**

```javascript
// Filter hanya slot yang tersedia
const availableSlots = response.data.filter((slot) => slot.available);

// Buat dropdown dengan display yang user-friendly
const dropdownOptions = availableSlots.map((slot) => ({
  value: slot.waktuMulai,
  label: slot.display,
}));
```

---

### Serbaguna Area Booking ⭐ **UPDATED - 2-HOUR SLOTS**

#### Get All Serbaguna Bookings

```http
GET /api/v1/serbaguna
```

#### Create Serbaguna Booking

```http
POST /api/v1/serbaguna
```

**Request Body:**

```json
{
  "idPenanggungJawab": "1",
  "idArea": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T15:00:00.000Z",
  "jumlahPengguna": "8",
  "keterangan": "Diskusi kelompok proyek",
  "isDone": false
}
```

**✨ Features:**

- **2-hour slots only** (berbeda dari endpoint lain yang 1 jam)
- **Area-specific booking** - Pilih area yang tersedia
- **Real-time availability** checking per area
- **User-friendly display** format
- **Smart conflict detection**
- **🌏 WIB Timezone Display** - All times displayed in WIB (UTC+7)

#### Get Available Areas

```http
GET /api/v1/serbaguna/areas
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "namaArea": "Area Meeting A"
    },
    {
      "id": "2",
      "namaArea": "Area Meeting B"
    }
  ]
}
```

#### Get Serbaguna by Area

```http
GET /api/v1/serbaguna/area/{areaId}
```

#### Get Available Time Slots for Area ⭐ **Smart Time Slots**

```http
GET /api/v1/serbaguna/time-slots?date=2024-01-15&areaId=1
```

**✨ Features:**

- **2-hour slots only** (berbeda dari endpoint lain yang 1 jam)
- **Area-specific filtering** - Hanya tampilkan slot untuk area tertentu
- **Real-time availability** checking
- **User-friendly display** format
- **Smart conflict detection**

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-14T23:00:00.000Z",
      "waktuBerakhir": "2024-01-15T01:00:00.000Z",
      "display": "06.00 - 08.00",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T01:00:00.000Z",
      "waktuBerakhir": "2024-01-15T03:00:00.000Z",
      "display": "08.00 - 10.00",
      "available": false
    }
  ],
  "message": "Saran slot waktu berhasil diambil"
}
```

**💡 Frontend Usage:**

```javascript
// Get available 2-hour slots for specific area
const getSerbagunaTimeSlots = async (date, areaId) => {
  const response = await fetch(`/api/v1/serbaguna/time-slots?date=${date}&areaId=${areaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Display available slots
    result.data.forEach(slot => {
      if (slot.available) {
        console.log(`Available: ${slot.display}`);
      }
    });
  }
};
```

#### Other Endpoints

- `PUT /api/v1/serbaguna/{id}` - Update booking
- `DELETE /api/v1/serbaguna/{id}` - Delete booking
- `GET /api/v1/serbaguna/{id}` - Get by ID
- `GET /api/v1/serbaguna/penanggung-jawab/{penanggungJawabId}` - Get by responsible person
- `GET /api/v1/serbaguna/time-slots?date=2024-01-15` - Get time slot suggestions

> ℹ️ **Update:** endpoint `PUT /api/v1/serbaguna/{id}` kini memverifikasi durasi 2 jam penuh dan mengecek konflik waktu bahkan saat hanya `waktuMulai` atau `waktuBerakhir` yang berubah.

---

### Kitchen Booking

#### Get All Kitchen Bookings

```http
GET /api/v1/dapur
```

#### Create Kitchen Booking

```http
POST /api/v1/dapur
```

**Request Body:**

```json
{
  "idFasilitas": "1",
  "idPeminjam": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z",
  "pinjamPeralatan": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "idFasilitas": "1",
    "idPeminjam": "1",
    "waktuMulai": "2024-01-15T13:00:00.000Z",
    "waktuBerakhir": "2024-01-15T14:00:00.000Z",
    "pinjamPeralatan": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "peminjam": {
      "id": "1",
      "namaLengkap": "John Doe",
      "namaPanggilan": "John",
      "nomorWa": "+6281234567890"
    },
    "fasilitas": {
      "id": "1",
      "fasilitas": "Kompor Gas"
    }
  },
  "message": "Booking dapur berhasil dibuat"
}
```

#### Get Available Kitchen Facilities

```http
GET /api/v1/dapur/facilities
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "fasilitas": "Kompor Gas"
    },
    {
      "id": "2",
      "fasilitas": "Microwave"
    }
  ]
}
```

#### Get Kitchen Bookings by Time Range

```http
GET /api/v1/dapur/time-range?startTime=2024-01-15T00:00:00.000Z&endTime=2024-01-15T23:59:59.999Z
```

#### Get Available Time Slots for Kitchen ⭐ **IMPROVED**

```http
GET /api/v1/dapur/time-slots?date=2024-01-15&facilityId=1
```

**✨ NEW FEATURES:**

- **Facility-Specific Filtering**: Parameter `facilityId` untuk cek availability fasilitas tertentu
- **Smart Availability**: Otomatis exclude waktu yang sudah dibooking
- **User-Friendly Display**: Format waktu Indonesia

**Parameters:**

- `date` (required): Format YYYY-MM-DD
- `facilityId` (optional): ID fasilitas spesifik untuk dicek

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T07:00:00.000Z",
      "display": "13.00 - 14.00",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T13:00:00.000Z",
      "waktuBerakhir": "2024-01-15T14:00:00.000Z",
      "display": "20.00 - 21.00",
      "available": false
    }
  ]
}
```

**💡 Usage Examples:**

```javascript
// Cek semua fasilitas
const allSlots = await fetch("/api/v1/dapur/time-slots?date=2024-01-15");

// Cek fasilitas tertentu (Kompor Gas)
const gasStoveSlots = await fetch(
  "/api/v1/dapur/time-slots?date=2024-01-15&facilityId=1"
);
```

#### Other Endpoints

- `PUT /api/v1/dapur/{id}` - Update booking
- `DELETE /api/v1/dapur/{id}` - Delete booking
- `GET /api/v1/dapur/{id}` - Get by ID
- `GET /api/v1/dapur/peminjam/{peminjamId}` - Get by borrower
- `GET /api/v1/dapur/fasilitas/{fasilitasId}` - Get by facility

---

### Women's Washing Machine Booking

#### Get All Women's Washing Machine Bookings

```http
GET /api/v1/mesin-cuci-cewe
```

#### Create Women's Washing Machine Booking

```http
POST /api/v1/mesin-cuci-cewe
```

**Request Body:**

```json
{
  "idFasilitas": "1",
  "idPeminjam": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z"
}
```

#### Get Available Women's Washing Machine Facilities

```http
GET /api/v1/mesin-cuci-cewe/facilities
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nama": "Mesin Cuci A - Cewe"
    },
    {
      "id": "2",
      "nama": "Mesin Cuci B - Cewe"
    }
  ]
}
```

#### Other Endpoints

- `PUT /api/v1/mesin-cuci-cewe/{id}` - Update booking
- `DELETE /api/v1/mesin-cuci-cewe/{id}` - Delete booking
- `GET /api/v1/mesin-cuci-cewe/{id}` - Get by ID
- `GET /api/v1/mesin-cuci-cewe/peminjam/{peminjamId}` - Get by borrower
- `GET /api/v1/mesin-cuci-cewe/fasilitas/{fasilitasId}` - Get by facility
- `GET /api/v1/mesin-cuci-cewe/time-range` - Get by time range
- `GET /api/v1/mesin-cuci-cewe/time-slots?date=2024-01-15&facilityId=1` - Get time slots

---

### Men's Washing Machine Booking

#### Get All Men's Washing Machine Bookings

```http
GET /api/v1/mesin-cuci-cowo
```

#### Create Men's Washing Machine Booking

```http
POST /api/v1/mesin-cuci-cowo
```

**Request Body:**

```json
{
  "idFasilitas": "1",
  "idPeminjam": "1",
  "waktuMulai": "2024-01-15T13:00:00.000Z",
  "waktuBerakhir": "2024-01-15T14:00:00.000Z"
}
```

#### Get Available Men's Washing Machine Facilities

```http
GET /api/v1/mesin-cuci-cowo/facilities
```

#### Other Endpoints

- `PUT /api/v1/mesin-cuci-cowo/{id}` - Update booking
- `DELETE /api/v1/mesin-cuci-cowo/{id}` - Delete booking
- `GET /api/v1/mesin-cuci-cowo/{id}` - Get by ID
- `GET /api/v1/mesin-cuci-cowo/peminjam/{peminjamId}` - Get by borrower
- `GET /api/v1/mesin-cuci-cowo/fasilitas/{fasilitasId}` - Get by facility
- `GET /api/v1/mesin-cuci-cowo/time-range` - Get by time range
- `GET /api/v1/mesin-cuci-cowo/time-slots?date=2024-01-15&facilityId=1` - Get time slots

---

### CWS (Community Work Space) Booking ⭐ **NEW**

#### Get All CWS Bookings

```http
GET /api/v1/cws
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "idPenanggungJawab": "1",
      "waktuMulai": "2024-01-15T14:00:00.000Z",
      "waktuBerakhir": "2024-01-15T16:00:00.000Z",
      "jumlahPengguna": "15",
      "keterangan": "Team collaboration session",
      "isDone": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "penanggungJawab": {
        "id": "1",
        "namaLengkap": "John Doe",
        "namaPanggilan": "John",
        "nomorWa": "+6281234567890"
      }
    }
  ]
}
```

#### Create CWS Booking

```http
POST /api/v1/cws
```

**Request Body:**

```json
{
  "idPenanggungJawab": "1",
  "waktuMulai": "2024-01-15T14:00:00.000Z",
  "waktuBerakhir": "2024-01-15T16:00:00.000Z",
  "jumlahPengguna": "15",
  "keterangan": "Team collaboration session",
  "isDone": false
}
```

**⚠️ CWS Special Requirements:**

- **2-hour time slots only** (e.g., 14:00-16:00, 16:00-18:00)
- **No 1-hour slots** - will be rejected with validation error
- **Available slots**: 06:00-08:00, 08:00-10:00, 10:00-12:00, 12:00-14:00, 14:00-16:00, 16:00-18:00, 18:00-20:00, 20:00-22:00
- **🚫 Thursday restriction** - CWS tidak bisa di book pada hari Kamis karena public only

**Validasi:**

- ✅ Waktu harus dalam slot 2 jam penuh (contoh: 14:00-16:00)
- ✅ Waktu tidak boleh di masa lalu
- ✅ **Hari Kamis tidak diperbolehkan** - "CWS tidak bisa di book pada hari Kamis karena public only"
- ✅ Penanggung jawab harus exist di database
- ✅ Ruang tidak boleh double booking

#### Update CWS Booking

```http
PUT /api/v1/cws/{id}
```

**Catatan:** Perubahan parsial akan tetap divalidasi—slot wajib 2 jam penuh, waktu tidak boleh lampau, Kamis tetap diblokir, dan konflik jadwal dicek sebelum disimpan.

#### Delete CWS Booking

```http
DELETE /api/v1/cws/{id}
```

#### Get CWS by Responsible Person

```http
GET /api/v1/cws/penanggung-jawab/{penanggungJawabId}
```

#### Get CWS Bookings by Date ⭐ **NEW**

```http
GET /api/v1/cws/date/{date}
```

**✨ Features:**

- **Daily schedule view** - Get all bookings for a specific date
- **Detailed information** - Includes responsible person details
- **Ordered by time** - Bookings sorted by start time
- **Perfect for calendar views** - Frontend can easily display daily schedule

**Parameters:**

- `date` (path, required): Date in YYYY-MM-DD format (e.g., "2025-09-15")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "3",
      "idPenanggungJawab": "2",
      "waktuMulai": "2025-09-15T03:00:00.000Z",
      "waktuBerakhir": "2025-09-15T05:00:00.000Z",
      "jumlahPengguna": "15",
      "keterangan": "belajar",
      "isDone": false,
      "createdAt": "2025-09-15T01:41:37.000Z",
      "updatedAt": "2025-09-15T01:41:37.000Z",
      "penanggungJawab": {
        "id": "2",
        "namaLengkap": "Hazel",
        "namaPanggilan": "Hazel",
        "nomorWa": "+6285790826168"
      }
    },
    {
      "id": "4",
      "idPenanggungJawab": "2",
      "waktuMulai": "2025-09-15T05:00:00.000Z",
      "waktuBerakhir": "2025-09-15T07:00:00.000Z",
      "jumlahPengguna": "10",
      "keterangan": "lala",
      "isDone": false,
      "createdAt": "2025-09-15T01:43:02.000Z",
      "updatedAt": "2025-09-15T01:43:02.000Z",
      "penanggungJawab": {
        "id": "2",
        "namaLengkap": "Hazel",
        "namaPanggilan": "Hazel",
        "nomorWa": "+6285790826168"
      }
    }
  ],
  "message": "Data booking CWS untuk tanggal 2025-09-15 berhasil diambil"
}
```

**💡 Frontend Usage:**

```javascript
// Get CWS bookings for a specific date
const getCWSBookingsByDate = async (date) => {
  const response = await fetch(`/api/v1/cws/date/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { data } = await response.json();

  // Display daily schedule
  const dailySchedule = data.map((booking) => ({
    id: booking.id,
    time: `${booking.waktuMulai} - ${booking.waktuBerakhir}`,
    responsible: booking.penanggungJawab.namaLengkap,
    users: booking.jumlahPengguna,
    notes: booking.keterangan,
    status: booking.isDone ? "Completed" : "Active",
  }));

  return dailySchedule;
};

// Usage
const todayBookings = await getCWSBookingsByDate("2025-09-15");
console.log("Today's CWS bookings:", todayBookings);
```

**Error Handling:**

```json
// Invalid date format
{
  "success": false,
  "message": "Format tanggal tidak valid",
  "errors": ["Format tanggal harus YYYY-MM-DD (contoh: 2025-09-15)"]
}
```

#### Get CWS Time Slots ⭐ **SMART SLOTS**

```http
GET /api/v1/cws/time-slots?date=2024-01-15
```

**✨ Features:**

- **2-hour slots only** (berbeda dari endpoint lain yang 1 jam)
- **Real-time availability** checking
- **User-friendly display** format
- **Smart conflict detection**
- **🌏 WIB Timezone Display** - All times displayed in WIB (UTC+7)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T08:00:00.000Z",
      "display": "13.00 - 15.00",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T14:00:00.000Z",
      "waktuBerakhir": "2024-01-15T16:00:00.000Z",
      "display": "21.00 - 23.00",
      "available": false
    }
  ]
}
```

**💡 Frontend Usage:**

```javascript
// Get available CWS time slots (2-hour only)
const response = await fetch("/api/v1/cws/time-slots?date=2024-01-15", {
  headers: { Authorization: `Bearer ${token}` },
});

const { data } = await response.json();

// Filter hanya slot yang tersedia (2-hour slots)
const available2HourSlots = data.filter((slot) => slot.available);

// Buat dropdown untuk 2-hour slots
const cwsOptions = available2HourSlots.map((slot) => ({
  value: slot.waktuMulai,
  label: slot.display, // "13.00 - 15.00"
  duration: "2 hours",
}));
```

#### Mark Past Bookings as Done ⭐ **NEW**

```http
POST /api/v1/cws/mark-past-done
```

**✨ Features:**

- **Auto-cleanup** - Automatically mark past bookings as done
- **Status management** - Updates `isDone` field for completed bookings
- **Maintenance tool** - Useful for keeping booking status up-to-date

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Past bookings berhasil di-mark sebagai done"
}
```

**💡 Frontend Usage:**

```javascript
// Mark past bookings as done (maintenance function)
const markPastBookingsDone = async () => {
  const response = await fetch("/api/v1/cws/mark-past-done", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();

  if (result.success) {
    console.log("Past bookings marked as done");
    // Refresh booking list to show updated status
    await refreshBookingList();
  }
};

// Usage - typically called periodically or on app startup
await markPastBookingsDone();
```

#### Other CWS Endpoints

- `GET /api/v1/cws/{id}` - Get by ID
- `GET /api/v1/cws/time-suggestions?date=2024-01-15` - Get time suggestions (without availability check)

---

## 🌏 **Timezone Handling**

### **Backend Timezone Configuration**

Semua endpoint booking menggunakan timezone handling yang konsisten:

- **Storage**: Waktu disimpan dalam UTC di database (standar internasional)
- **Display**: Waktu ditampilkan dalam WIB (UTC+7) untuk user Indonesia
- **Conversion**: Otomatis menggunakan `timeZone: 'Asia/Jakarta'` untuk display

### **Contoh Konversi Waktu**

| UTC Time | WIB Time | Display         |
| -------- | -------- | --------------- |
| 23:00    | 06:00    | "06.00 - 08.00" |
| 00:00    | 07:00    | "07.00 - 09.00" |
| 01:00    | 08:00    | "08.00 - 10.00" |
| 13:00    | 20:00    | "20.00 - 22.00" |

### **Frontend Integration**

Frontend tidak perlu melakukan konversi timezone - backend sudah menyediakan:

- `waktuMulai` dan `waktuBerakhir` dalam UTC (untuk perhitungan)
- `display` dalam format WIB yang user-friendly (untuk tampilan)

```javascript
// Backend response sudah include display time dalam WIB
{
  "waktuMulai": "2025-09-14T23:00:00.000Z",  // UTC untuk perhitungan
  "waktuBerakhir": "2025-09-15T01:00:00.000Z", // UTC untuk perhitungan
  "display": "06.00 - 08.00", // WIB untuk tampilan
  "available": true
}
```

---

## 🕐 Smart Time Slots ⭐ **NEW FEATURE**

### 🎯 Overview

Semua endpoint booking sekarang memiliki fitur **Smart Time Slots** yang otomatis menampilkan availability real-time dan format user-friendly.

### 🚀 Key Features

1. **🔍 Real-time Availability Check**

   - Slot yang sudah dibooking otomatis ditandai `available: false`
   - Data selalu up-to-date dengan database

2. **🎨 User-Friendly Display Format**

   - Format waktu Indonesia: `"13.00 - 14.00"`
   - Mudah dibaca untuk frontend UI

3. **🎯 Facility-Specific Filtering**
   - Parameter `facilityId` untuk cek availability fasilitas tertentu
   - Berguna untuk multi-facility bookings

### 📋 Supported Endpoints

| Endpoint                             | Facility Filtering | Format           |
| ------------------------------------ | ------------------ | ---------------- |
| `/api/v1/mesin-cuci-cewe/time-slots` | ✅ `facilityId`    | 1-hour slots     |
| `/api/v1/mesin-cuci-cowo/time-slots` | ✅ `facilityId`    | 1-hour slots     |
| `/api/v1/dapur/time-slots`           | ✅ `facilityId`    | 1-hour slots     |
| `/api/v1/communal/available-slots`   | ✅ `lantai`        | 1-hour slots     |
| `/api/v1/serbaguna/time-slots`       | ✅ `areaId`        | **2-hour slots** |
| `/api/v1/cws/time-slots` ⭐          | ❌ No filtering    | **2-hour slots** |

### 💻 Frontend Integration Examples

#### 1. Basic Usage - Get Available Slots

```javascript
// GET available time slots
const response = await fetch(
  "/api/v1/mesin-cuci-cewe/time-slots?date=2024-01-15",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const { data } = await response.json();

// Filter hanya slot yang tersedia
const availableSlots = data.filter((slot) => slot.available);
console.log(`Found ${availableSlots.length} available slots`);
```

#### 2. Create Dropdown Options

```javascript
// Buat options untuk dropdown/select
const createTimeSlotOptions = (slots) => {
  return slots
    .filter((slot) => slot.available)
    .map((slot) => ({
      value: slot.waktuMulai,
      label: slot.display,
      data: slot,
    }));
};

const options = createTimeSlotOptions(data);
// Result: [{ value: "2024-01-15T06:00:00.000Z", label: "13.00 - 14.00", data: {...} }]
```

#### 3. Facility-Specific Check

```javascript
// Cek availability untuk fasilitas tertentu
const checkFacilityAvailability = async (date, facilityId) => {
  const response = await fetch(
    `/api/v1/dapur/time-slots?date=${date}&facilityId=${facilityId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const { data } = await response.json();
  return data.filter((slot) => slot.available);
};

// Usage
const kompor1Available = await checkFacilityAvailability("2024-01-15", "1");
const kompor2Available = await checkFacilityAvailability("2024-01-15", "2");
```

#### 4. CWS 2-Hour Slots Example ⭐

```javascript
// Get CWS time slots (2-hour slots only)
const getCWSTimeSlots = async (date) => {
  const response = await fetch(`/api/v1/cws/time-slots?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { data } = await response.json();

  // Filter available 2-hour slots
  const available2HourSlots = data.filter((slot) => slot.available);

  return available2HourSlots.map((slot) => ({
    value: slot.waktuMulai,
    label: slot.display, // "13.00 - 15.00"
    duration: "2 hours",
    type: "CWS",
  }));
};

// Usage - berbeda dari endpoint lain yang 1 jam
const cwsSlots = await getCWSTimeSlots("2024-01-15");
console.log("Available 2-hour CWS slots:", cwsSlots);
```

#### 5. Real-time Availability Component

```javascript
// React component example
const TimeSlotSelector = ({ date, facilityId, onSelect }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const url = `/api/v1/dapur/time-slots?date=${date}${
        facilityId ? `&facilityId=${facilityId}` : ""
      }`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = await response.json();
      setSlots(data);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchSlots();
  }, [date, facilityId]);

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Pilih waktu...</option>
      {slots
        .filter((slot) => slot.available)
        .map((slot) => (
          <option key={slot.waktuMulai} value={slot.waktuMulai}>
            {slot.display}
          </option>
        ))}
    </select>
  );
};
```

### 🔄 Response Format

```json
{
  "success": true,
  "data": [
    {
      "waktuMulai": "2024-01-15T06:00:00.000Z",
      "waktuBerakhir": "2024-01-15T07:00:00.000Z",
      "display": "13.00 - 14.00",
      "available": true
    },
    {
      "waktuMulai": "2024-01-15T07:00:00.000Z",
      "waktuBerakhir": "2024-01-15T08:00:00.000Z",
      "display": "14.00 - 15.00",
      "available": false
    }
  ],
  "message": "Saran slot waktu berhasil diambil"
}
```

### 🎯 Best Practices

1. **Always Filter Available Slots**

   ```javascript
   const availableOnly = data.filter((slot) => slot.available);
   ```

2. **Use Display Property for UI**

   ```javascript
   const displayTime = slot.display; // "13.00 - 14.00"
   ```

3. **Implement Real-time Refresh**

   ```javascript
   // Refresh slots setiap 30 detik atau setelah booking
   setInterval(fetchSlots, 30000);
   ```

4. **Handle Loading States**
   ```javascript
   if (loading) return <div>Loading time slots...</div>;
   ```

---

## ⏰ Validasi Waktu

### Aturan Umum

1. **Slot Waktu 1 Jam**: Semua booking menggunakan slot 1 jam penuh

   - ✅ Valid: 13:00:00 - 14:00:00
   - ❌ Invalid: 13:30:00 - 14:30:00

2. **Waktu Harus Tepat Jam**: Menit, detik, dan milidetik harus 0

   - ✅ Valid: 2024-01-15T13:00:00.000Z
   - ❌ Invalid: 2024-01-15T13:15:00.000Z

3. **Tidak Boleh Masa Lalu**: Waktu booking tidak boleh sebelum waktu saat ini

4. **Jam Operasional**: 06:00 - 22:00 (16 slot per hari)

### Format Waktu

Gunakan format ISO 8601:

```
2024-01-15T13:00:00.000Z
```

### Slot Waktu Tersedia

```
06:00-07:00, 07:00-08:00, 08:00-09:00, 09:00-10:00,
10:00-11:00, 11:00-12:00, 12:00-13:00, 13:00-14:00,
14:00-15:00, 15:00-16:00, 16:00-17:00, 17:00-18:00,
18:00-19:00, 19:00-20:00, 20:00-21:00, 21:00-22:00
```

---

## 💡 Contoh Penggunaan

### 1. Register User Baru ⚠️ TEMPORARILY DISABLED

```javascript
// POST /api/v1/auth/register (CURRENTLY DISABLED)
// This endpoint is temporarily disabled for maintenance
const response = await fetch("http://localhost:3000/api/v1/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    idAngkatan: "1",
    namaLengkap: "Alice Johnson",
    namaPanggilan: "Alice",
    nomorWa: "+6281234567893",
    password: "password123",
  }),
});

const result = await response.json();
// Current response will be:
// {
//   "success": false,
//   "error": "Not Found",
//   "message": "Route /api/v1/auth/register not found"
// }
console.log("Register endpoint disabled:", result.message);
```

### 2. Login User

```javascript
// POST /api/v1/auth/login
const response = await fetch("http://localhost:3000/api/v1/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    nomorWa: "+6281234567893",
    password: "password123",
  }),
});

const result = await response.json();
if (result.success) {
  // Simpan token untuk request selanjutnya
  localStorage.setItem("token", result.data.token);
  console.log("Login successful:", result.data.user);
} else {
  console.error("Login failed:", result.message);
}
```

### 3. Cek Slot Waktu Tersedia untuk Communal (dengan Authentication)

```javascript
// GET /api/v1/communal/available-slots/2024-01-15/2
const token = localStorage.getItem("token");
const response = await fetch(
  "http://localhost:3000/api/v1/communal/available-slots/2024-01-15/2",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (response.status === 401) {
  console.error("Token expired or invalid. Please login again.");
  // Redirect to login
  return;
}

const result = await response.json();
if (result.success) {
  // Filter hanya slot yang tersedia
  const availableSlots = result.data.filter((slot) => slot.available);
  console.log("Available slots:", availableSlots);
} else {
  console.error("Error:", result.message);
}
```

### 4. Booking Ruang Communal (dengan Authentication)

```javascript
// POST /api/v1/communal
const token = localStorage.getItem("token");
const bookingData = {
  idPenanggungJawab: "1",
  waktuMulai: "2024-01-15T15:00:00.000Z",
  waktuBerakhir: "2024-01-15T16:00:00.000Z",
  jumlahPengguna: "8",
  lantai: "2",
  keterangan: "Workshop programming",
  isDone: false,
};

const response = await fetch("http://localhost:3000/api/v1/communal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(bookingData),
});

if (response.status === 401) {
  console.error("Token expired or invalid. Please login again.");
  return;
}

const result = await response.json();
if (result.success) {
  console.log("Booking berhasil:", result.data);
} else {
  console.error("Booking gagal:", result.message);
}
```

### 4. Get Booking History untuk User

```javascript
// GET /api/v1/communal/penanggung-jawab/1
const userId = "1";
const response = await fetch(
  `http://localhost:3000/api/v1/communal/penanggung-jawab/${userId}`
);
const result = await response.json();

console.log("Booking history:", result.data);
```

### 5. Update Booking Status

```javascript
// PUT /api/v1/communal/1
const bookingId = "1";
const updateData = {
  isDone: true,
  keterangan: "Meeting selesai dengan baik",
};

const response = await fetch(
  `http://localhost:3000/api/v1/communal/${bookingId}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  }
);

const result = await response.json();
console.log("Update result:", result);
```

### 6. Get Data dengan Pagination

```javascript
// GET /api/v1/users?page=2&limit=20&sortBy=namaLengkap&sortOrder=asc
const params = new URLSearchParams({
  page: "2",
  limit: "20",
  sortBy: "namaLengkap",
  sortOrder: "asc",
});

const response = await fetch(`http://localhost:3000/api/v1/users?${params}`);
const result = await response.json();

console.log("Users:", result.data);
console.log("Pagination info:", result.pagination);
```

---

## 🔧 Tips untuk Frontend Developer

### 1. Handling BigInt Fields

Semua ID dalam response menggunakan string format karena JavaScript tidak mendukung BigInt secara native dalam JSON.

```javascript
// ✅ Correct
const userId = "1";

// ❌ Wrong
const userId = 1;
```

### 2. Date Handling

Selalu gunakan format ISO 8601 untuk tanggal:

```javascript
// ✅ Correct
const waktuMulai = new Date("2024-01-15T13:00:00.000Z").toISOString();

// ❌ Wrong
const waktuMulai = "2024-01-15 13:00:00";
```

### 3. Error Handling

Selalu cek field `success` dalam response dan handle authentication errors:

```javascript
const token = localStorage.getItem("token");
const response = await fetch("/api/v1/users", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Check for authentication errors
if (response.status === 401) {
  console.error("Token expired or invalid. Please login again.");
  localStorage.removeItem("token");
  // Redirect to login page
  window.location.href = "/login";
  return;
}

const result = await response.json();

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.message);
  if (result.errors) {
    console.error("Details:", result.errors);
  }
}
```

### 4. Pagination Implementation

Contoh implementasi pagination di frontend:

```javascript
function buildPaginationUrl(baseUrl, page, limit, sortBy, sortOrder) {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  return `${baseUrl}?${params.toString()}`;
}

// Usage
const url = buildPaginationUrl("/api/v1/users", 2, 20, "namaLengkap", "asc");
```

### 5. Complete API Helper Class

```javascript
class KaizenAPI {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("authToken");
  }

  // Authentication methods
  async login(nomorWa, password) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomorWa, password }),
    });

    const result = await response.json();

    if (result.success) {
      this.token = result.data.token;
      localStorage.setItem("authToken", this.token);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  }

  async logout() {
    localStorage.removeItem("authToken");
    this.token = null;
  }

  // Generic API call with authentication
  async apiCall(endpoint, options = {}) {
    if (!this.token) {
      throw new Error("Not authenticated. Please login first.");
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      this.token = null;
      throw new Error("Token expired. Please login again.");
    }

    return response.json();
  }

  // User methods
  async getUsers(page = 1, limit = 10) {
    return this.apiCall(`/api/v1/users?page=${page}&limit=${limit}`);
  }

  async getProfile() {
    return this.apiCall("/api/v1/auth/profile");
  }

  // Booking methods
  async getCommunalBookings() {
    return this.apiCall("/api/v1/communal");
  }

  async createCommunalBooking(bookingData) {
    return this.apiCall("/api/v1/communal", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getAvailableSlots(date, lantai) {
    return this.apiCall(`/api/v1/communal/available-slots/${date}/${lantai}`);
  }

  // Helper methods
  generateTimeSlots() {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const start = `${hour.toString().padStart(2, "0")}:00`;
      const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
      slots.push({
        value: hour,
        label: `${start} - ${end}`,
        startTime: start,
        endTime: end,
      });
    }
    return slots;
  }

  createBookingTime(date, hour) {
    const bookingDate = new Date(date);
    bookingDate.setHours(hour, 0, 0, 0);
    return bookingDate.toISOString();
  }

  isTokenExpired() {
    if (!this.token) return true;

    try {
      const payload = JSON.parse(atob(this.token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// Usage example
const api = new KaizenAPI();

// Login
try {
  const userData = await api.login("+6285790826168", "12345678");
  console.log("Logged in:", userData.user);
} catch (error) {
  console.error("Login failed:", error.message);
}

// Get users
try {
  const users = await api.getUsers(1, 20);
  console.log("Users:", users.data);
} catch (error) {
  console.error("Failed to get users:", error.message);
}

// Create booking
try {
  const booking = await api.createCommunalBooking({
    idPenanggungJawab: "1",
    waktuMulai: api.createBookingTime("2024-01-15", 13),
    waktuBerakhir: api.createBookingTime("2024-01-15", 14),
    jumlahPengguna: "5",
    lantai: "2",
    keterangan: "Meeting tim",
    isDone: false,
  });
  console.log("Booking created:", booking.data);
} catch (error) {
  console.error("Booking failed:", error.message);
}
```

### 6. React Hook untuk Kaizen API

```javascript
// useKaizenAPI.js
import { useState, useEffect, useCallback } from "react";

export function useKaizenAPI() {
  const [api] = useState(() => new KaizenAPI());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!api.isTokenExpired()) {
        try {
          const profile = await api.getProfile();
          setUser(profile.data);
        } catch (err) {
          console.error("Failed to get profile:", err.message);
        }
      }
    };

    checkAuth();
  }, [api]);

  const login = useCallback(
    async (nomorWa, password) => {
      setLoading(true);
      setError(null);

      try {
        const userData = await api.login(nomorWa, password);
        setUser(userData.user);
        return userData;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, [api]);

  const apiCall = useCallback(
    async (endpoint, options) => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.apiCall(endpoint, options);
        return result;
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Token expired")) {
          setUser(null);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    api,
    user,
    loading,
    error,
    login,
    logout,
    apiCall,
    isAuthenticated: !!user,
  };
}

// Usage in React component
function App() {
  const { user, login, logout, apiCall, loading, error, isAuthenticated } =
    useKaizenAPI();
  const [users, setUsers] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login("+6285790826168", "12345678");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await apiCall("/api/v1/users");
      setUsers(result.data);
    } catch (err) {
      alert("Failed to load users: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <form onSubmit={handleLogin}>
        <input type="tel" placeholder="Nomor WA" required />
        <input type="password" placeholder="Password" required />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.namaLengkap}</h1>
      <button onClick={logout}>Logout</button>
      <button onClick={loadUsers}>Load Users</button>

      {users.length > 0 && (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.namaLengkap} - {u.nomorWa}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 7. Form Validation Helper

```javascript
// validation.js
export const validators = {
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  phoneNumber: (value) => {
    if (!value.startsWith("+62")) {
      return "Phone number must start with +62";
    }
    if (!/^\+62\d{9,13}$/.test(value)) {
      return "Invalid phone number format";
    }
    return null;
  },

  bookingTime: (waktuMulai, waktuBerakhir) => {
    const start = new Date(waktuMulai);
    const end = new Date(waktuBerakhir);
    const now = new Date();

    if (start <= now) {
      return "Booking time cannot be in the past";
    }

    if (start.getMinutes() !== 0 || start.getSeconds() !== 0) {
      return "Start time must be at exact hour (e.g., 13:00:00)";
    }

    if (end.getMinutes() !== 0 || end.getSeconds() !== 0) {
      return "End time must be at exact hour (e.g., 14:00:00)";
    }

    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours !== 1) {
      return "Booking must be exactly 1 hour";
    }

    return null;
  },
};

export function validateForm(data, rules) {
  const errors = {};

  for (const [field, validations] of Object.entries(rules)) {
    for (const validation of validations) {
      const error = validation(data[field], field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Usage
const bookingData = {
  idPenanggungJawab: "1",
  waktuMulai: "2024-01-15T13:00:00.000Z",
  waktuBerakhir: "2024-01-15T14:00:00.000Z",
  jumlahPengguna: "5",
  keterangan: "Test booking",
};

const validation = validateForm(bookingData, {
  idPenanggungJawab: [validators.required],
  waktuMulai: [validators.required],
  waktuBerakhir: [validators.required],
  jumlahPengguna: [validators.required],
  keterangan: [validators.required],
});

if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
} else {
  // Proceed with API call
  console.log("Data is valid");
}
```

---

## 📞 Support

Jika ada pertanyaan atau masalah dengan API, silakan hubungi tim development atau buat issue di repository project.

---

## 🛠️ Troubleshooting

### 🔍 Debug Mode

Enable debug mode untuk melihat detail request/response:

```javascript
// Enable debug logging
const DEBUG = true;

async function debugApiCall(url, options = {}) {
  if (DEBUG) {
    console.log("🔍 API Request:", {
      url,
      method: options.method || "GET",
      headers: options.headers,
      body: options.body,
    });
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (DEBUG) {
    console.log("📨 API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: result,
    });
  }

  return result;
}
```

### 🔧 Common Issues Checklist

#### **Before Making Any API Call:**

- [ ] ✅ Server is running (`curl http://localhost:3000/health`)
- [ ] ✅ Using correct base URL (`http://localhost:3000`)
- [ ] ✅ Content-Type header set to `application/json` for POST/PUT
- [ ] ✅ Request body is properly JSON stringified

#### **For Authentication:**

- [ ] ✅ User exists in database (check test credentials)
- [ ] ✅ Password is correct (case-sensitive)
- [ ] ✅ Phone number includes country code (`+62`)
- [ ] ✅ Token is stored in localStorage/sessionStorage
- [ ] ✅ Authorization header format: `Bearer <token>`

#### **For Protected Endpoints:**

- [ ] ✅ Token is not expired (max 1 hour)
- [ ] ✅ Token is valid (not corrupted)
- [ ] ✅ Authorization header is included
- [ ] ✅ Handle 401 responses properly

#### **For Booking APIs:**

- [ ] ✅ Time is in ISO 8601 format
- [ ] ✅ Time slots are exactly 1 hour (e.g., 13:00-14:00)
- [ ] ✅ Minutes, seconds, milliseconds are 0
- [ ] ✅ Booking time is not in the past
- [ ] ✅ Required fields are provided

### 🧪 Testing Tools

#### **1. Browser DevTools**

```javascript
// Test in browser console
// 1. Login
fetch("http://localhost:3000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nomorWa: "+6285790826168",
    password: "12345678",
  }),
})
  .then((r) => r.json())
  .then(console.log);

// 2. Test protected endpoint
const token = "your_token_here";
fetch("http://localhost:3000/api/v1/users", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then(console.log);
```

#### **2. Postman Collection**

```json
{
  "info": { "name": "Kaizen API" },
  "auth": {
    "type": "bearer",
    "bearer": [{ "key": "token", "value": "{{jwt_token}}" }]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "pm.request.headers.add({key: 'Content-Type', value: 'application/json'});"
        ]
      }
    }
  ]
}
```

#### **3. cURL Examples**

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nomorWa": "+6285790826168", "password": "12345678"}' \
  | jq .

# Get users (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/users | jq .

# Create booking
curl -X POST http://localhost:3000/api/v1/communal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "idPenanggungJawab": "1",
    "waktuMulai": "2024-01-15T13:00:00.000Z",
    "waktuBerakhir": "2024-01-15T14:00:00.000Z",
    "jumlahPengguna": "5",
    "lantai": "2",
    "keterangan": "Test booking"
  }' | jq .
```

### 🚨 Emergency Debugging

#### **Issue: "Cannot connect to server"**

```bash
# Check server status
ps aux | grep "ts-node\|node"

# Check port usage
lsof -i :3000

# Restart server
pkill -f "ts-node"
npm run dev
```

#### **Issue: "Database connection failed"**

```bash
# Check MariaDB status
brew services list | grep mariadb

# Test database connection
mariadb -h localhost -P 3306 -u root -e "SHOW DATABASES;"

# Check if kaizen database exists
mariadb -h localhost -P 3306 -u root -e "USE kaizen; SHOW TABLES;"
```

#### **Issue: "All API calls return 500"**

```bash
# Check server logs
tail -f server.log  # or check terminal where server is running

# Check for missing environment variables
cat .env

# Restart with debug mode
DEBUG=* npm run dev
```

### 📞 Getting Help

1. **Check server logs** - Terminal tempat server running
2. **Check browser DevTools** - Network tab dan Console
3. **Test dengan cURL** - Pastikan API endpoint berfungsi
4. **Periksa database** - Pastikan data exist
5. **Check authentication flow** - Login → Get token → Use token

### 🔄 Reset Everything

Jika semua tidak berfungsi, reset environment:

```bash
# 1. Stop server
pkill -f "ts-node"

# 2. Clear node modules
rm -rf node_modules package-lock.json
npm install

# 3. Reset database (if needed)
mariadb -h localhost -P 3306 -u root -e "DROP DATABASE IF EXISTS kaizen;"

# 4. Rebuild database
mariadb -h localhost -P 3306 -u root < database_schema.sql

# 5. Start fresh
npm run dev
```

---

## 📋 **Complete Endpoint Summary**

### 🔐 **Authentication Endpoints**

- `POST /api/v1/auth/login` - Login to get JWT token
- ~~`POST /api/v1/auth/register`~~ - **TEMPORARILY DISABLED**

### 👥 **User Management**

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `GET /api/v1/users/angkatan/{angkatanId}` - Get users by batch
- `GET /api/v1/users/wa/{nomorWa}` - Get user by WhatsApp number

### 🏢 **Booking Endpoints**

#### **Communal Room (1-hour slots)**

- `GET /api/v1/communal` - Get all bookings
- `POST /api/v1/communal` - Create booking
- `GET /api/v1/communal/{id}` - Get by ID
- `PUT /api/v1/communal/{id}` - Update booking
- `DELETE /api/v1/communal/{id}` - Delete booking
- `GET /api/v1/communal/penanggung-jawab/{id}` - Get by responsible person
- `GET /api/v1/communal/lantai/{lantai}` - Get by floor
- `GET /api/v1/communal/available-slots/{date}/{lantai}` - ⭐ Smart time slots

#### **Serbaguna Area (2-hour slots) ⭐ UPDATED**

- `GET /api/v1/serbaguna` - Get all bookings
- `POST /api/v1/serbaguna` - Create booking
- `GET /api/v1/serbaguna/{id}` - Get by ID
- `PUT /api/v1/serbaguna/{id}` - Update booking
- `DELETE /api/v1/serbaguna/{id}` - Delete booking
- `GET /api/v1/serbaguna/areas` - Get available areas
- `GET /api/v1/serbaguna/area/{areaId}` - Get by area
- `GET /api/v1/serbaguna/time-slots?date={date}&areaId={areaId}` - ⭐ Smart 2-hour time slots

#### **Kitchen/Dapur (1-hour slots)**

- `GET /api/v1/dapur` - Get all bookings
- `POST /api/v1/dapur` - Create booking
- `GET /api/v1/dapur/{id}` - Get by ID
- `PUT /api/v1/dapur/{id}` - Update booking
- `DELETE /api/v1/dapur/{id}` - Delete booking
- `GET /api/v1/dapur/facilities` - Get available facilities
- `GET /api/v1/dapur/time-slots?date=YYYY-MM-DD&facilityId=X` - ⭐ Smart time slots

#### **Women's Washing Machine (1-hour slots)**

- `GET /api/v1/mesin-cuci-cewe` - Get all bookings
- `POST /api/v1/mesin-cuci-cewe` - Create booking
- `GET /api/v1/mesin-cuci-cewe/{id}` - Get by ID
- `PUT /api/v1/mesin-cuci-cewe/{id}` - Update booking
- `DELETE /api/v1/mesin-cuci-cewe/{id}` - Delete booking
- `GET /api/v1/mesin-cuci-cewe/facilities` - Get available facilities
- `GET /api/v1/mesin-cuci-cewe/time-slots?date=YYYY-MM-DD&facilityId=X` - ⭐ Smart time slots

#### **Men's Washing Machine (1-hour slots)**

- `GET /api/v1/mesin-cuci-cowo` - Get all bookings
- `POST /api/v1/mesin-cuci-cowo` - Create booking
- `GET /api/v1/mesin-cuci-cowo/{id}` - Get by ID
- `PUT /api/v1/mesin-cuci-cowo/{id}` - Update booking
- `DELETE /api/v1/mesin-cuci-cowo/{id}` - Delete booking
- `GET /api/v1/mesin-cuci-cowo/facilities` - Get available facilities
- `GET /api/v1/mesin-cuci-cowo/time-slots?date=YYYY-MM-DD&facilityId=X` - ⭐ Smart time slots

#### **Theater (1-hour slots)** ⭐ **NEW**

- `GET /api/v1/theater` - Get all bookings
- `POST /api/v1/theater` - Create booking
- `GET /api/v1/theater/{id}` - Get by ID
- `PUT /api/v1/theater/{id}` - Update booking
- `DELETE /api/v1/theater/{id}` - Delete booking
- `GET /api/v1/theater/penanggung-jawab/{id}` - Get by responsible person
- `GET /api/v1/theater/time-slots?date=YYYY-MM-DD` - ⭐ Slot availability with status
- `GET /api/v1/theater/time-suggestions?date=YYYY-MM-DD` - Quick slot suggestions

> Theater follows the same 1-hour validation rules as Communal (06:00-22:00 WIB).

**Sample Create**

```http
POST /api/v1/theater
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "idPenanggungJawab": "2",
  "waktuMulai": "2025-10-15T09:00:00.000Z",
  "waktuBerakhir": "2025-10-15T10:00:00.000Z",
  "jumlahPengguna": "20",
  "keterangan": "Gladi bersih"
}
```

**Slot Availability**

```http
GET /api/v1/theater/time-slots?date=2025-10-15
Authorization: Bearer <TOKEN>
```

Response payload contains `display` (WIB format) and `available` flags for each hour.

#### **CWS - Community Work Space (2-hour slots)** ⭐ **NEW**

- `GET /api/v1/cws` - Get all bookings
- `POST /api/v1/cws` - Create booking
- `GET /api/v1/cws/{id}` - Get by ID
- `PUT /api/v1/cws/{id}` - Update booking
- `DELETE /api/v1/cws/{id}` - Delete booking
- `GET /api/v1/cws/penanggung-jawab/{id}` - Get by responsible person
- `GET /api/v1/cws/date/{date}` - ⭐ **Get bookings by date** (NEW)
- `POST /api/v1/cws/mark-past-done` - ⭐ **Mark past bookings as done** (NEW)
- `GET /api/v1/cws/time-slots?date=YYYY-MM-DD` - ⭐ Smart time slots (2-hour)
- `GET /api/v1/cws/time-suggestions?date=YYYY-MM-DD` - Basic time suggestions (2-hour)

### 🔑 **Key Differences**

| Feature                | Most Endpoints         | CWS                   |
| ---------------------- | ---------------------- | --------------------- |
| **Time Slots**         | 1-hour slots           | **2-hour slots**      |
| **Available Hours**    | 06:00-22:00 (16 slots) | 06:00-22:00 (8 slots) |
| **Facility Filtering** | ✅ Supported           | ❌ No filtering       |
| **Smart Availability** | ✅ Available           | ✅ Available          |

### 🚀 **Quick Access**

- **🏠 Server**: `http://localhost:3000`
- **📚 Swagger UI**: `http://localhost:3000/api/docs`
- **🔍 Health Check**: `http://localhost:3000/health`
- **📋 API Info**: `http://localhost:3000/api/v1`

---

**Happy Coding! 🚀**
