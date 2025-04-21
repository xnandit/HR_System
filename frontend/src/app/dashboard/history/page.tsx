"use client";
import { useEffect, useState } from "react";

interface AttendanceRecord {
  id: string;
  createdAt: string;
  type: string;
  status?: string;
  zona?: { name: string; company?: { name: string } };
  checkoutAt?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data riwayat");
        const data = await res.json();
        setHistory(data);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token, apiUrl]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#5fa98a', marginBottom: 16 }}>Riwayat Kehadiran</h2>
      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Belum ada riwayat kehadiran.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e8f5f0', color: '#222' }}>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Tanggal</th>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Checkin</th>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Checkout</th>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Status</th>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Keterangan</th>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Zona</th>
              <th style={{ padding: 8, borderRadius: 4, color: '#222' }}>Perusahaan</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rec) => {
              const checkinDate = rec.createdAt ? new Date(rec.createdAt) : null;
              const tanggal = checkinDate ? checkinDate.toLocaleDateString() : '-';
              const jamCheckin = checkinDate ? checkinDate.toLocaleTimeString() : '-';
              const checkoutDate = rec.checkoutAt ? new Date(rec.checkoutAt) : null;
              const jamCheckout = checkoutDate ? checkoutDate.toLocaleTimeString() : '-';
              let statusStr = '-';
              let keteranganStr = '-';
              if (rec.createdAt) {
                statusStr = 'Hadir';
                if (!rec.checkoutAt) {
                  keteranganStr = 'Belum Checkout';
                } else if (rec.status === 'tepat waktu' || rec.status === 'Tepat waktu') {
                  keteranganStr = 'Tepat waktu';
                } else if (rec.status === 'telat' || rec.status === 'Telat') {
                  keteranganStr = 'Telat';
                } else {
                  keteranganStr = '-';
                }
              } else if (rec.type === 'absent') {
                statusStr = 'Absent';
                keteranganStr = 'Tidak Checkin';
              }
              return (
                <tr key={rec.id} style={{ borderBottom: '1px solid #f0f0f0', color: '#222' }}>
                  <td style={{ padding: 8, color: '#222' }}>{tanggal}</td>
                  <td style={{ padding: 8, color: '#222' }}>{jamCheckin}</td>
                  <td style={{ padding: 8, color: '#222' }}>{rec.checkoutAt ? jamCheckout : '-'}</td>
                  <td style={{ padding: 8, color: '#222' }}>{statusStr}</td>
                  <td style={{ padding: 8, color: '#222' }}>{keteranganStr}</td>
                  <td style={{ padding: 8, color: '#222' }}>{rec.zona?.name || '-'}</td>
                  <td style={{ padding: 8, color: '#222' }}>{rec.zona?.company?.name || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
