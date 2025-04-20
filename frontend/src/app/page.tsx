"use client";
import QrScanner from "../components/QrScanner";
import { useState } from "react";
import LoginPage from "./login";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [absenType, setAbsenType] = useState<'checkin' | 'checkout'>('checkin');

  const handleScan = async (qr: string) => {
    setScanResult(qr);
    setAttendanceStatus(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrValue: qr, type: absenType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal absen");
      }
      setAttendanceStatus("Absen berhasil!");
    } catch (e: unknown) {
      if (e instanceof Error) setAttendanceStatus(e.message);
      else setAttendanceStatus('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 gap-8">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 text-center">Absensi Karyawan</h1>
      <p className="text-gray-700 text-center max-w-md mb-4">
        Silakan scan QR code yang tersedia di kantor untuk mencatat kehadiran Anda.
      </p>
      <div className="w-full max-w-xs bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <QrScanner onScan={handleScan} />
      </div>
      <div className="flex gap-4 mt-4">
        <button
          className={`px-4 py-2 rounded font-bold border ${absenType === 'checkin' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border-blue-700'}`}
          onClick={() => setAbsenType('checkin')}
        >
          Check In
        </button>
        <button
          className={`px-4 py-2 rounded font-bold border ${absenType === 'checkout' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border-blue-700'}`}
          onClick={() => setAbsenType('checkout')}
        >
          Check Out
        </button>
      </div>
      {loading && <div className="mt-4 text-blue-700">Mengirim data absen...</div>}
      {scanResult && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded border border-green-300 max-w-xs w-full text-center">
          <strong>Hasil Scan:</strong> <br />{scanResult}
        </div>
      )}
      {attendanceStatus && (
        <div className={`mt-2 text-center ${attendanceStatus === "Absen berhasil!" ? "text-green-700" : "text-red-600"}`}>
          {attendanceStatus}
        </div>
      )}
      <button
        className="mt-6 px-4 py-2 bg-gray-400 text-white rounded"
        onClick={() => setToken(null)}
      >
        Logout
      </button>
      <footer className="mt-8 text-xs text-gray-400 text-center">
        {new Date().getFullYear()} Employee Attendances
      </footer>
    </div>
  );
}
