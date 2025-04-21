"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Proteksi route: redirect ke login jika tidak ada token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <div>
      {/* Dashboard navigation bar */}
      <nav className={styles.navbar}>
        <a href="/dashboard/attendance" className={styles.navlink}>Kehadiran</a>
        <a href="/dashboard/history" className={styles.navlink}>Riwayat Kehadiran</a>
        <a href="/dashboard/profile" className={styles.navlink}>Profil</a>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </nav>
      <main style={{ padding: '2rem 0' }}>{children}</main>
    </div>
  );
}
