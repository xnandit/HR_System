"use client";
import QrScanner from "../../../components/QrScanner";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [absenType, setAbsenType] = useState<'checkin' | 'checkout'>('checkin');
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [forceCheckoutEnabled, setForceCheckoutEnabled] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const res = await fetch(`${apiUrl}/attendance?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const hasCheckin = data.some((a: any) => a.type === 'checkin' || a.type === 'late');
          const hasCheckout = data.some((a: any) => a.type === 'checkout');
          setAlreadyCheckedIn(hasCheckin);
          setAlreadyCheckedOut(hasCheckout);
          setCheckoutEnabled(hasCheckin && !hasCheckout);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceStatus();
  }, []);

  const handleScan = async (qr: string) => {
    console.log('handleScan called', { qr, scannerEnabled, alreadyCheckedIn, alreadyCheckedOut, absenType });
    // Hanya batasi checkin, tapi checkout tetap boleh
    if (!scannerEnabled || (absenType === 'checkin' && alreadyCheckedIn)) return;
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
        if (err.message && err.message.includes("Sudah melakukan checkin")) {
          setAttendanceStatus("Anda sudah melakukan check-in hari ini di zona ini.");
          setAlreadyCheckedIn(true);
          setForceCheckoutEnabled(true); 
          return;
        }
        throw new Error(err.message || "Gagal absen");
      }
      setAttendanceStatus("Absen berhasil!");
      if (absenType === 'checkin') {
        setCheckoutEnabled(true);
      } else {
        setCheckoutEnabled(false);
        setAlreadyCheckedOut(true);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setAttendanceStatus(e.message);
      else setAttendanceStatus('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassQR = async () => {
    const bypassQR = {
      type: "attendance_qr",
      companyId: 1,
      companyName: "PT.A",
      zonaId: 1,
      zonaName: "Kantor Cabang 1",
      issuedAt: "2025-04-21T08:09:14.612Z"
    };
    console.log('handleBypassQR absenType:', absenType);
    await handleScan(JSON.stringify(bypassQR));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#5fa98a', marginBottom: 16 }}>Absensi Kehadiran</h2>
      {loading ? (
        <div style={{ textAlign: 'center' }}><Button variant="ghost" disabled>Loading...</Button></div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <Button
              onClick={() => setAbsenType('checkin')}
              disabled={alreadyCheckedIn || alreadyCheckedOut}
              style={{
                background: (alreadyCheckedIn || alreadyCheckedOut) ? '#b0b0b0' : '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontWeight: 500,
                cursor: (alreadyCheckedIn || alreadyCheckedOut) ? 'not-allowed' : 'pointer',
                opacity: (alreadyCheckedIn || alreadyCheckedOut) ? 0.7 : 1,
              }}
            >
              Check In
            </Button>
            <Button
              onClick={() => setAbsenType('checkout')}
              disabled={!alreadyCheckedIn || alreadyCheckedOut}
              style={{
                background: (!alreadyCheckedIn || alreadyCheckedOut) ? '#b0b0b0' : '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontWeight: 500,
                cursor: (!alreadyCheckedIn || alreadyCheckedOut) ? 'not-allowed' : 'pointer',
                opacity: (!alreadyCheckedIn || alreadyCheckedOut) ? 0.7 : 1,
              }}
            >
              Check Out
            </Button>
          </div>
          <button
            style={{ marginBottom: 12, background: '#e0c13b', color: '#333', border: 'none', borderRadius: 4, padding: '8px 24px', display: 'block', marginLeft: 'auto', marginRight: 'auto', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            onClick={() => { console.log('BYPASS QR clicked', { loading, alreadyCheckedIn, alreadyCheckedOut, absenType }); handleBypassQR(); }}
            disabled={loading || (alreadyCheckedIn && alreadyCheckedOut)}
          >
            BYPASS QR (DEV ONLY)
          </button>
          <button
            style={{ marginBottom: 24, background: showScanner ? '#e57373' : '#5fa98a', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', display: 'block', marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}
            onClick={() => setShowScanner((prev) => !prev)}
            disabled={loading}
          >
            {showScanner ? 'Tutup Scan QR' : 'Tampilkan Scan QR'}
          </button>
          {showScanner && (
            <>
              <QrScanner onScan={handleScan} enabled={scannerEnabled} />
              <button
                style={{ marginTop: 16, background: '#b4cfc2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                onClick={() => setScannerEnabled(true)}
                disabled={loading || alreadyCheckedIn}
              >
                Scan Ulang
              </button>
            </>
          )}
          {scanResult && (
            <div style={{ marginTop: 12, textAlign: 'center', color: '#888' }}>
              <strong>Hasil Scan:</strong> <br />{scanResult}
            </div>
          )}
          {attendanceStatus && (
            <div style={{ marginTop: 8, textAlign: 'center', color: attendanceStatus.includes('berhasil') ? "#198754" : "#e74c3c" }}>
              {attendanceStatus}
            </div>
          )}
        </>
      )}
    </div>
  );
}
