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
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#5fa98a', marginBottom: 16 }}>Riwayat Kehadiran</h2>
      {loading ? (
        <div style={{ textAlign: 'center' }}><Button variant="ghost" disabled>Loading...</Button></div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Belum ada riwayat kehadiran.</div>
      ) : (
        <Card style={{ padding: 0, margin: 0 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Perusahaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((rec) => {
                const tanggal = rec.date ? new Date(rec.date).toLocaleDateString() : '-';
                const jamCheckin = rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '-';
                const jamCheckout = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '-';
                return (
                  <TableRow key={rec.id}>
                    <TableCell>{tanggal}</TableCell>
                    <TableCell>{jamCheckin}</TableCell>
                    <TableCell>{rec.checkOut ? jamCheckout : '-'}</TableCell>
                    <TableCell><StatusPill status={getStatus(rec)} /></TableCell>
                    <TableCell>{getKeterangan(rec)}</TableCell>
                    <TableCell>{rec.zona?.name || '-'}</TableCell>
                    <TableCell>{rec.zona?.company?.name || '-'}</TableCell>
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
