# Backend Development Plan: Employee Attendance System

## 1. Project Overview
Sistem absensi karyawan berbasis web menggunakan NestJS (backend) dan Next.js (frontend).

---

## 2. Stack & Tools Digunakan
- **NestJS** (TypeScript)
- **Prisma ORM** (PostgreSQL)
- **@nestjs/jwt** (JWT authentication)
- **@nestjs/config** (environment management)
- **bcryptjs** (password hashing)
- **passport-jwt** (JWT strategy)
- **Postman** (API testing)
- **dotenv** (.env config)

## 3. Flow Absensi
- **Flow absensi:**
  - User scan QR code statis yang ditempel di kantor menggunakan aplikasi frontend.
  - Data QR (misal: office_id/token unik kantor) dikirim ke backend bersama data user (dari JWT).
  - Backend mencatat kehadiran user pada waktu tersebut.
  - Rencana pengembangan: validasi lokasi GPS agar user hanya bisa absen di area kantor.

---

## 4. Fitur & Modul yang Sudah Dikerjakan
- [x] User registration & login
- [x] JWT authentication (dengan env config & modular)
- [x] User module (CRUD dasar, login, register)
- [x] Prisma integration & migration
- [x] Error handling basic (conflict, unauthorized)

---

## 5. Target & Rencana Berikutnya
- [ ] **Attendance Module**
  - [ ] CRUD absensi (check-in, check-out)
  - [ ] Relasi user-attendance
  - [ ] Proteksi endpoint dengan JWT
  - [ ] Query attendance by user/date
- [ ] **Admin Module**
  - [ ] Manajemen user (CRUD, role)
  - [ ] Rekap data absensi
- [ ] **Integrasi QR Code** (opsional)
- [ ] **Unit & Integration Test** (Jest)
- [ ] **Dokumentasi API** (Swagger/OpenAPI)

---

## 6. Catatan
- Setiap module baru akan dibuat dengan struktur NestJS (module, controller, service, DTO).
- Semua endpoint yang sensitif akan diproteksi JWT.
- Setiap perubahan besar dicatat di plan.md agar progress terpantau.

---

## 7. Progress Terakhir
- User module & JWT sudah berjalan normal dan siap digunakan.
- Siap lanjut ke attendance module.

---

*Dokumen ini akan diupdate setiap ada progress penting atau perubahan rencana.*
