"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-steel-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-card">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">Lekk</h1>
          <p className="mt-1 text-sm text-steel-500">
            ระบบรับซื้อของเก่า สำหรับคนขายของเก่า
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-danger-light p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-steel-700"
            >
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="mt-1 block w-full rounded-md border border-steel-200 bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-steel-700"
            >
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 block w-full rounded-md border border-steel-200 bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 min-h-touch"
          >
            {loading ? "กำลังเข้าระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-steel-400">
          Lekk POS v0.1.0
        </p>
      </div>
    </main>
  );
}
