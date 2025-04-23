import React from "react";
import { Card } from "@/components/ui/card";

interface StatusSummaryCardProps {
  count: number;
  label: string;
}

// Warna: hijau = Tepat Waktu, kuning = Telat, merah = Absent
const statusColor = (label: string) => {
  if (label.toLowerCase().includes("tepat") || label.toLowerCase().includes("waktu")) return "#43b77a"; // hijau
  if (label.toLowerCase().includes("telat")) return "#ffd600"; // kuning
  if (label.toLowerCase().includes("absent")) return "#e74c3c"; // merah
  return "#b0b0b0";
};

export default function StatusSummaryCard({ count, label }: StatusSummaryCardProps) {
  return (
    <Card style={{ flex: 1, minWidth: 120, textAlign: "center", padding: 18 }}>
      <div style={{ color: statusColor(label), fontWeight: 700, fontSize: 22 }}>{count}</div>
      <div style={{ color: "#555", fontWeight: 500, fontSize: 16 }}>{label}</div>
    </Card>
  );
}
