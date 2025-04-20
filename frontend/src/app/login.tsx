"use client";
import { useState } from "react";

export default function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Login gagal");
      const data = await res.json();
      if (!data.access_token) throw new Error("Token tidak ditemukan");
      onLogin(data.access_token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-8 p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold text-blue-900 mb-2 text-center">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border px-3 py-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border px-3 py-2 rounded"
      />
      <button type="submit" className="bg-blue-700 text-white py-2 rounded font-bold" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </form>
  );
}
