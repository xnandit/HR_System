// Fungsi utilitas untuk menghitung workHour (HH:MM:SS) dari dua tanggal
export function calculateWorkHour(checkIn: Date | string, checkOut: Date | string): string {
  if (!checkIn || !checkOut) return '';
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  if (isNaN(diffMs) || diffMs < 0) return '';
  const totalSeconds = Math.floor(diffMs / 1000);
  const jam = Math.floor(totalSeconds / 3600);
  const menit = Math.floor((totalSeconds % 3600) / 60);
  const detik = totalSeconds % 60;
  return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
}
