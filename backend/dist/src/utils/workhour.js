"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWorkHour = calculateWorkHour;
function calculateWorkHour(checkIn, checkOut) {
    if (!checkIn || !checkOut)
        return '';
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    if (isNaN(diffMs) || diffMs < 0)
        return '';
    const totalSeconds = Math.floor(diffMs / 1000);
    const jam = Math.floor(totalSeconds / 3600);
    const menit = Math.floor((totalSeconds % 3600) / 60);
    const detik = totalSeconds % 60;
    return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
}
//# sourceMappingURL=workhour.js.map