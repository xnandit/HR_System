"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  id: number;
  date: string; // ISO string
  checkIn?: string | null;
  checkOut?: string | null;
  status?: string | null;
  workHour?: string | null;
  zona?: { name: string; company?: { name: string } };
  // Optionally, you can add schedule info if backend provides it
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

  // Helper: status sesuai rules
  function getStatus(rec: AttendanceRecord): string {
    if (rec.status === 'on-time') return 'Hadir';
    if (rec.status === 'late') return 'Hadir';
    if (rec.checkIn) return 'Hadir';
    return 'Absent';
  }

  // Helper: determine keterangan sesuai rules.md
  function getKeterangan(rec: AttendanceRecord): string {
    if (!rec.checkIn) return "Tidak Check-in";
    if (!rec.checkOut) return "Belum Checkout";
    // Keterangan langsung ambil dari status
    if (rec.status === 'on-time') return 'Tepat waktu';
    if (rec.status === 'late') return 'Telat';
    return "-";
  }

  function StatusPill({ status }: { status: string }) {
    if (!status || status === 'Absent') return <Badge variant="secondary">-</Badge>;
    if (status === 'Hadir') return <Badge className="bg-green-500 text-white">Hadir</Badge>;
    return <Badge>{status}</Badge>;
  }

  return (
    <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32, overflowX: 'unset' }}>
      <h2 style={{ textAlign: 'center', color: '#5fa98a', marginBottom: 16 }}>Riwayat Kehadiran</h2>
      {loading ? (
        <div style={{ textAlign: 'center' }}><Button variant="ghost" disabled>Loading...</Button></div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Belum ada riwayat kehadiran.</div>
      ) : (
        <Card style={{ padding: 0, margin: 0, width: '100%' }}>
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader>
              <TableRow>
                <TableHead style={{ textAlign: 'center', width: '13%' }}>Tanggal</TableHead>
                <TableHead style={{ textAlign: 'center', width: '13%' }}>Check-in</TableHead>
                <TableHead style={{ textAlign: 'center', width: '13%' }}>Check-out</TableHead>
                <TableHead style={{ textAlign: 'center', width: '12%' }}>Status</TableHead>
                <TableHead style={{ textAlign: 'center', width: '15%' }}>Keterangan</TableHead>
                <TableHead style={{ textAlign: 'center', width: '12%' }}>Jam Kerja</TableHead>
                <TableHead style={{ textAlign: 'center', width: '12%' }}>Zona</TableHead>
                <TableHead style={{ textAlign: 'center', width: '10%' }}>Perusahaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((rec) => {
                const tanggal = rec.date ? new Date(rec.date).toLocaleDateString() : '-';
                const jamCheckin = rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '-';
                const jamCheckout = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '-';
                return (
                  <TableRow key={rec.id}>
                    <TableCell style={{ textAlign: 'center' }}>{tanggal}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{jamCheckin}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{rec.checkOut ? jamCheckout : '-'}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}><StatusPill status={getStatus(rec)} /></TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{getKeterangan(rec)}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{rec.workHour || '-'}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{rec.zona?.name || '-'}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>{rec.zona?.company?.name || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
