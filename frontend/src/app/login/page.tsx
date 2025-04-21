"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Login gagal");
      const data = await res.json();
      if (!data.access_token) throw new Error("Token tidak ditemukan");
      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard/attendance");
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bgMintGreen + " min-h-screen flex items-center justify-center"}>
      <div className={styles.diamondBg}>
        <form onSubmit={handleSubmit} className={styles.loginBox}>
          <h2 className={styles.loginTitle}>CUSTOMER LOGIN</h2>
          <div className={styles.inputGroup}>
            <span className={styles.iconUser} />
            <Input
              type="email"
              placeholder="Username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={styles.loginInput}
              autoComplete="username"
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.iconLock} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={styles.loginInput}
              autoComplete="current-password"
            />
          </div>
          <div className={styles.inputGroup}>
            <label style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ marginRight: 6 }}
              />
              Tampilkan Password
            </label>
          </div>
          {error && <div style={{ color: '#e74c3c', marginBottom: 8, textAlign: 'center' }}>{error}</div>}
          <Button type="submit" className={styles.loginBtn} disabled={loading} style={{ marginTop: 12, width: '100%' }}>
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
