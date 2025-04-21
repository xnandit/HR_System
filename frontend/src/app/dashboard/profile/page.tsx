"use client";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data profil");
        const data = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, apiUrl]);

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e0e0e0', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#5fa98a', marginBottom: 16 }}>Profil Pengguna</h2>
      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Data profil tidak ditemukan.</div>
      ) : (
        <div style={{ fontSize: 18, color: '#444', lineHeight: '2.2' }}>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Nama:</strong> {profile.name || '-'}</div>
          <div><strong>Role:</strong> {profile.role || '-'}</div>
        </div>
      )}
    </div>
  );
}
