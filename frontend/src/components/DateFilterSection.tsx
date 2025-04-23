import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaDownload } from "react-icons/fa";

interface DateFilterSectionProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearch: () => void;
  onDownload: () => void;
}

export default function DateFilterSection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onDownload,
}: DateFilterSectionProps) {
  return (
    <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
      <div style={{ flex: 1, maxWidth: 180 }}>
        <label style={{ fontWeight: 500, color: '#444' }}>Tanggal Mulai</label>
        <Input type="date" value={startDate} onChange={e => onStartDateChange(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={{ flex: 1, maxWidth: 180 }}>
        <label style={{ fontWeight: 500, color: '#444' }}>Tanggal Berakhir</label>
        <Input type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)} style={{ width: '100%' }} />
      </div>
      <Button style={{ marginTop: 24, height: 40, background: '#1976d2', color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onSearch}>
        <FaSearch style={{ fontSize: 18 }} /> CARI
      </Button>
      <Button variant="outline" style={{ marginTop: 24, height: 40, marginLeft: 12, color: '#1976d2', borderColor: '#1976d2', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }} onClick={onDownload}>
        <FaDownload style={{ fontSize: 18 }} /> DOWNLOAD LAPORAN
      </Button>
    </div>
  );
}
