"use client";
import QrScanner from "../../../components/QrScanner";
import { useState } from "react";

export default function AttendancePage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [absenType, setAbsenType] = useState<'checkin' | 'checkout'>('checkin');
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const handleScan = async (qr: string) => {
    if (!scannerEnabled) return;
    setScanResult(qr);
    setAttendanceStatus(null);
    setLoading(true);
    setScannerEnabled(false);
    try {
      const res = await fetch(`${apiUrl}/attendance`, {
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
      if (absenType === 'checkin') {
        setCheckoutEnabled(true);
      } else {
        setCheckoutEnabled(false);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setAttendanceStatus(e.message);
      else setAttendanceStatus('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#5fa98a', marginBottom: 16 }}>Scan QR Kehadiran</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <button
          onClick={() => setAbsenType('checkin')}
          style={{ background: absenType === 'checkin' ? '#5fa98a' : '#e8f5f0', color: absenType === 'checkin' ? '#fff' : '#5fa98a', border: 'none', borderRadius: 4, padding: '8px 20px', marginRight: 8, fontWeight: 500 }}
        >
          Check-in
        </button>
        <button
          onClick={() => setAbsenType('checkout')}
          disabled={!checkoutEnabled}
          style={{ background: absenType === 'checkout' ? '#5fa98a' : '#e8f5f0', color: absenType === 'checkout' ? '#fff' : '#5fa98a', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 500, opacity: checkoutEnabled ? 1 : 0.6 }}
        >
          Check-out
        </button>
      </div>
      <QrScanner
        onScan={handleScan}
        enabled={scannerEnabled}
        style={{ margin: '0 auto', display: 'block', width: 260, height: 260 }}
      />
      {scanResult && (
        <div style={{ marginTop: 12, textAlign: 'center', color: '#888' }}>
          <strong>Hasil Scan:</strong> <br />{scanResult}
        </div>
      )}
      {attendanceStatus && (
        <div style={{ marginTop: 8, textAlign: 'center', color: attendanceStatus === "Absen berhasil!" ? "#198754" : "#e74c3c" }}>
          {attendanceStatus}
        </div>
      )}
      <button
        style={{ marginTop: 24, background: '#b4cfc2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        onClick={() => setScannerEnabled(true)}
        disabled={loading}
      >
        Scan Ulang
      </button>
    </div>
  );
}
