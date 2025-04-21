# Rules Kehadiran Employee Attendance System

## 1. Status Kehadiran
- **Hadir**: User melakukan check-in pada hari tersebut.
  - **Tepat waktu**: Check-in dilakukan sebelum atau sama dengan waktu jadwal masuk + toleransi + sudah check-out.
  - **Telat**: Check-in dilakukan setelah waktu jadwal masuk + toleransi + sudah check-out.
  - **Belum Checkout**: User sudah check-in tetapi belum melakukan checkout (data checkout kosong).
- **Absent**: User tidak melakukan check-in pada hari tersebut (tidak ada data kehadiran).

## 2. Kolom Riwayat Kehadiran
- **Tanggal**: Tanggal saja
- **Check-in**: Jam Check-in
- **Check-out**: Jam Check-out, kalau belum ada "-"
- **Status**: "Hadir" jika sudah check-in, "Absent" jika tidak ada check-in
- **Keterangan**: "Tepat waktu"/"Telat"/"Belum Checkout"/"Tidak Check-in"
- **Zona**: Nama zona kehadiran
- **Perusahaan**: Nama perusahaan

## 3. Rules Perhitungan
- **Tepat waktu**: `waktu kehadiran <= jadwal masuk + toleransi`
- **Telat**: `waktu kehadiran > jadwal masuk + toleransi`
- **Belum Checkout**: Sudah check-in, data checkout kosong
- **Absent**: Tidak ada data check-in pada hari tersebut

---

> **Catatan:**
> Rules dapat berubah/ditambah sewaktu-waktu sesuai kebutuhan bisnis.
