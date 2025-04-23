"use client";
import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusSummaryCard from "@/components/StatusSummaryCard";
import DateFilterSection from "@/components/DateFilterSection";
import UserCard from "@/components/UserCard";
import { exportAttendanceToExcel } from "./excelExport";

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
  // Default filter: hari ini (format YYYY-MM-DD)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<{ name: string; email: string; role: string }[]>([]);
  const [summary, setSummary] = useState([
    { count: 0, label: "Tepat Waktu" },
    { count: 0, label: "Telat" },
    { count: 0, label: "Absent" },
  ]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Fetch summary & history
  const fetchSummaryAndHistory = async (params?: {startDate?: string, endDate?: string, userId?: string}) => {
    setLoading(true);
    try {
      // fetch summary
      let summaryUrl = `${apiUrl}/attendance/summary`;
      let historyUrl = `${apiUrl}/attendance/employee-history`;
      const urlParams = new URLSearchParams();
      if (params?.startDate) urlParams.append('startDate', params.startDate);
      if (params?.endDate) urlParams.append('endDate', params.endDate);
      if (params?.userId) urlParams.append('userId', params.userId);
      if ([...urlParams].length) {
        summaryUrl += `?${urlParams.toString()}`;
        historyUrl += `?${urlParams.toString()}`;
      }
      const [summaryRes, historyRes] = await Promise.all([
        fetch(summaryUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(historyUrl, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!summaryRes.ok) throw new Error('Gagal fetch summary');
      if (!historyRes.ok) throw new Error('Gagal fetch history');
      const summaryData = await summaryRes.json();
      const historyData = await historyRes.json();
      setSummary([
        { count: summaryData.onTime || 0, label: "Tepat Waktu" },
        { count: summaryData.late || 0, label: "Telat" },
        { count: summaryData.absent || 0, label: "Absent" },
      ]);
      setData(historyData);
    } catch {
      setSummary([
        { count: 0, label: "Tepat Waktu" },
        { count: 0, label: "Telat" },
        { count: 0, label: "Absent" },
      ]);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data hanya untuk hari ini saat pertama kali load
  useEffect(() => {
    fetchSummaryAndHistory({ startDate: todayStr, endDate: todayStr });
  }, [token, apiUrl]);

  useEffect(() => {
    // Hanya fetch jika role admin
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin") {
        fetch(`${apiUrl}/user/company`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setUsers(data))
          .catch(() => setUsers([]));
      }
    } catch {
      setUsers([]);
    }
  }, [apiUrl, token]);

  const handleSearch = () => {
    fetchSummaryAndHistory({ startDate, endDate });
  };
  const handleDownload = () => {
    exportAttendanceToExcel(mappedData, 'attendance_report.xlsx');
  };

  // Perbaiki mapping data agar workHour tetap muncul jika dikirim dari backend, fallback ke perhitungan FE jika tidak ada (format HH:MM:SS)
  const mappedData = Array.isArray(data)
    ? data.map((item: any) => {
        let workHour = item.workHour;
        if (!workHour && item.checkIn && item.checkOut) {
          // Fallback: hitung di FE jika BE tidak kirim, format HH:MM:SS
          const checkIn = new Date(item.checkIn);
          const checkOut = new Date(item.checkOut);
          const diffMs = checkOut.getTime() - checkIn.getTime();
          const totalSeconds = Math.floor(diffMs / 1000);
          const jam = Math.floor(totalSeconds / 3600);
          const menit = Math.floor((totalSeconds % 3600) / 60);
          const detik = totalSeconds % 60;
          workHour = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
        }
        return {
          id: item.id,
          name: item.name || (item.user && item.user.name) || '',
          checkIn: item.checkIn,
          checkInStatus: item.checkInStatus || item.status || '',
          checkInLocation: item.checkInLocation || '',
          checkOut: item.checkOut,
          checkOutStatus: item.checkOutStatus || '',
          workHour,
          date: item.date,
        };
      })
    : [];

  // Group data by date
  const grouped = mappedData.reduce((acc: Record<string, EmployeeAttendance[]>, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  // Komponen StatusPill untuk label status
  function StatusPill({ status }: { status: string }) {
    if (!status || status === 'Absent' || status === '-') return <Badge variant="secondary">-</Badge>;
    if (status === 'Hadir' || status === 'on-time') return <Badge className="bg-green-500 text-white">Hadir</Badge>;
    if (status === 'Telat' || status === 'late') return <Badge className="bg-yellow-500 text-white">Telat</Badge>;
    return <Badge>{status}</Badge>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: 0, background: 'none', boxShadow: 'none' }}>
      <h2 style={{ color: '#222', fontWeight: 700, fontSize: 26, marginBottom: 24, padding: 32 }}>Ringkasan Laporan</h2>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 36, width: '100%', margin: '0 auto', marginBottom: 32 }}>
        <DateFilterSection
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSearch={handleSearch}
          onDownload={handleDownload}
        />
      </div>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 36, width: '100%', margin: '0 auto', marginBottom: 32, display: 'flex', gap: 16, justifyContent: 'center' }}>
        {summary.map((item) => (
          <StatusSummaryCard key={item.label} count={item.count} label={item.label} />
        ))}
      </div>
      {/* Tabel data */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 36, width: '100%', margin: '0 auto', overflowX: 'unset' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            type="text"
            placeholder="Cari nama karyawan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>
        {loading ? (
          <div style={{ textAlign: 'center' }}><Button variant="ghost" disabled>Loading...</Button></div>
        ) : (
          <div style={{ width: '100%' }}>
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'center', width: '22%' }}>Nama Karyawan</TableHead>
                  <TableHead style={{ textAlign: 'center', width: '19%' }}>Waktu Check In</TableHead>
                  <TableHead style={{ textAlign: 'center', width: '19%' }}>Waktu Check Out</TableHead>
                  <TableHead style={{ textAlign: 'center', width: '20%' }}>Status</TableHead>
                  <TableHead style={{ textAlign: 'center', width: '20%' }}>Jam Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(grouped).map((date) => (
                  <React.Fragment key={date}>
                    <TableRow>
                      <TableCell colSpan={5} style={{ background: '#f8f9fa', fontWeight: 600, color: '#444' }}>
                        Tanggal {date.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                    {grouped[date]
                      .filter(row => typeof row.name === 'string' && row.name.toLowerCase().includes(search.toLowerCase()))
                      .map((row) => (
                        <TableRow key={row.id}>
                          <TableCell style={{ textAlign: 'center' }}>{row.name}</TableCell>
                          <TableCell style={{ textAlign: 'center' }}>{row.checkIn ? new Date(row.checkIn).toLocaleTimeString('id-ID', { hour12: false }) : '-'}</TableCell>
                          <TableCell style={{ textAlign: 'center' }}>{row.checkOut ? new Date(row.checkOut).toLocaleTimeString('id-ID', { hour12: false }) : '-'}</TableCell>
                          <TableCell style={{ textAlign: 'center' }}><StatusPill status={row.checkInStatus || '-'} /></TableCell>
                          <TableCell style={{ textAlign: 'center' }}>{row.workHour || '-'}</TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
