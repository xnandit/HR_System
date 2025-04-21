"use client";
import React from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Ringkasan Laporan", href: "/dashboard/history" },
  { label: "Kehadiran", href: "/dashboard/attendance" },
  { label: "Laporan", href: "/dashboard/report" },
  { label: "Pengumuman", href: "/dashboard/announcement" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    // Add your logout logic here
  };

  const pathname = usePathname();

  return (
    <div className={styles.dashboardRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Appsensi</div>
        <nav className={styles.menu}>
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                styles.menuItem,
                pathname.startsWith(item.href) ? styles.active : ""
              ].filter(Boolean).join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button className={styles.logoutBtn} onClick={handleLogout} style={{ margin: 24 }}>Logout</Button>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
