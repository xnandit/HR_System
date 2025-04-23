import * as XLSX from 'xlsx';
import type { EmployeeAttendance } from './page';

export function exportAttendanceToExcel(data: EmployeeAttendance[], fileName = 'attendance_report.xlsx') {
  // Format data sesuai kolom pada table
  const rows = data.map(row => ({
    'Nama Karyawan': row.name,
    'Waktu Check In': row.checkIn ? new Date(row.checkIn).toLocaleString() : '-',
    'Waktu Check Out': row.checkOut ? new Date(row.checkOut).toLocaleString() : '-',
    'Status': row.checkInStatus || '-',
    'Jam Kerja': row.workHour || '-',
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Absensi');
  XLSX.writeFile(workbook, fileName);
}
