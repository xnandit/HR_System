"use client";
import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmployeeAttendance {
  id: number;
  name: string;
  checkIn: string | null;
  checkInStatus: string | null;
  checkInLocation: string | null;
  checkOut: string | null;
  checkOutStatus: string | null;
  workHour: string | null;
  date: string;
}

export default function EmployeeHistoryPage() {
  const [data, setData] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/attendance/employee-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data ringkasan laporan");
        const data = await res.json();
        setData(data);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, apiUrl]);

  // Group data by date
  const grouped = data.reduce((acc: Record<string, EmployeeAttendance[]>, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32 }}>
      <h2 style={{ color: '#222', fontWeight: 700, fontSize: 26, marginBottom: 24 }}>Ringkasan Laporan</h2>
      {/* Filter dan summary (dummy) */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500, color: '#444' }}>Tanggal Mulai</label>
          <Input type="date" style={{ width: '100%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500, color: '#444' }}>Tanggal Berakhir</label>
          <Input type="date" style={{ width: '100%' }} />
        </div>
        <Button style={{ marginTop: 24, height: 40 }}>CARI</Button>
        <Button variant="outline" style={{ marginTop: 24, height: 40, marginLeft: 12 }}>DOWNLOAD LAPORAN</Button>
      </div>
      {/* Summary cards (dummy) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#43b77a', fontWeight: 700, fontSize: 22 }}>88</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Tepat Waktu</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#ffb300', fontWeight: 700, fontSize: 22 }}>4</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Dalam Toleransi</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: 22 }}>0</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Telat</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 22 }}>0</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Waktu Dikoreksi</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#43b77a', fontWeight: 700, fontSize: 22 }}>91</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Dalam Lokasi</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#ffb300', fontWeight: 700, fontSize: 22 }}>0</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Dalam Lokasi Toleransi</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: 22 }}>0</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Di Luar Lokasi</div>
        </Card>
        <Card style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 18 }}>
          <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 22 }}>0</div>
          <div style={{ color: '#555', fontWeight: 500, fontSize: 16 }}>Lokasi Dikoreksi</div>
        </Card>
      </div>
      {/* Tabel data */}
      {loading ? (
        <div style={{ textAlign: 'center' }}><Button variant="ghost" disabled>Loading...</Button></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          {Object.keys(grouped).map((date) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{ background: '#f8f9fa', fontWeight: 600, color: '#444', padding: 8, borderRadius: 4, marginBottom: 4 }}>
                Tanggal {date}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Waktu Check In</TableHead>
                    <TableHead>Status Masuk</TableHead>
                    <TableHead>Lokasi Check In</TableHead>
                    <TableHead>Waktu Check Out</TableHead>
                    <TableHead>Status Keluar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jam Kerja</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped[date].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.checkIn || '-'}</TableCell>
                      <TableCell><StatusPill status={row.checkInStatus} /></TableCell>
                      <TableCell>{row.checkInLocation || '-'}</TableCell>
                      <TableCell>{row.checkOut || '-'}</TableCell>
                      <TableCell>{row.checkOutStatus || '-'}</TableCell>
                      <TableCell>{row.checkIn ? 'Check In' : '-'}</TableCell>
                      <TableCell>{row.workHour || '-'}</TableCell>
                      <TableCell><span style={{ background: '#f3f3f3', padding: '4px 10px', borderRadius: 4, fontSize: 16, color: '#1976d2', cursor: 'pointer' }}>🪪</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  if (!status) return <Badge variant="secondary">-</Badge>;
  if (status === 'Tepat Waktu') return <Badge className="bg-green-500 text-white">Tepat Waktu</Badge>;
  if (status === 'Dalam Toleransi') return <Badge className="bg-yellow-500 text-white">Dalam Toleransi</Badge>;
  if (status === 'Telat') return <Badge className="bg-red-500 text-white">Telat</Badge>;
  if (status === 'Lainnya') return <Badge className="bg-red-500 text-white">Lainnya</Badge>;
  return <Badge>{status}</Badge>;
}
