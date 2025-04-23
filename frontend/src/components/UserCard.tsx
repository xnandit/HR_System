import React from "react";
import { Card } from "@/components/ui/card";

interface UserCardProps {
  name: string;
  email: string;
  role: string;
}

export default function UserCard({ name, email, role }: UserCardProps) {
  return (
    <Card style={{ minWidth: 220, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
      <div style={{ color: '#888', fontSize: 14 }}>{email}</div>
      <div style={{ color: '#43b77a', fontWeight: 500, fontSize: 14 }}>{role}</div>
    </Card>
  );
}
