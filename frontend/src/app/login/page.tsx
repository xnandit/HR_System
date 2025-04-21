"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

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
            <input
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
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={styles.loginInput}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.showPasswordBtn}
              onClick={() => setShowPassword(s => !s)}
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8db7a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.09-2.86 3.05-5.17 5.62-6.44"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/><path d="M14.47 14.47A3 3 0 0 1 12 9a3 3 0 0 1-2.47 5.47"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8db7a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="7"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Loading..." : "LOGIN"}
          </button>
          {error && <div className={styles.loginError}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
