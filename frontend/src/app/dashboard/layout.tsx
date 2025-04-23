"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  // Proteksi route: redirect ke login jika tidak ada token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    // Decode JWT to get role (assume payload contains 'role')
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role || null);
    } catch {
      setRole(null);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  // Menu: dynamic by role
  type MenuItem = { label: string; href: string };
  let menu: MenuItem[] = [];
  if (role === "admin") {
    menu = [
      { label: "Ringkasan Laporan", href: "/dashboard/employee-history" },
      { label: "Riwayat Kehadiran", href: "/dashboard/history" },
      { label: "Kehadiran", href: "/dashboard/attendance" },
      { label: "Profil", href: "/dashboard/profile" },
    ];
  } else if (role === "employee") {
    menu = [
      { label: "Riwayat Kehadiran", href: "/dashboard/history" },
      { label: "Kehadiran", href: "/dashboard/attendance" },
      { label: "Profil", href: "/dashboard/profile" },
    ];
  } else {
    // Default menu (optional)
    menu = [
      { label: "Ringkasan Laporan", href: "/dashboard/history" },
      { label: "Kehadiran", href: "/dashboard/attendance" },
      { label: "Profil", href: "/dashboard/profile" },
    ];
  }

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
        <Button className={styles.logoutBtn} onClick={handleLogout} style={{ margin: 24 }}>
          Logout
        </Button>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
