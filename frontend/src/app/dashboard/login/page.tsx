"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEMO_OFFICERS } from "@/lib/auth-constants";
import { ShieldCheck, Lock, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (officer: typeof DEMO_OFFICERS[0]) => {
    setEmail(officer.email);
    setPassword(officer.password);
    handleLogin(undefined, officer.email, officer.password);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-20 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="border border-charcoal/20 bg-white p-8 md:p-16 shadow-luxury-card">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-1">
                KVIC & National Bee Board
              </p>
              <h1 className="text-4xl serif text-charcoal font-normal">Officer Portal Login</h1>
              <p className="text-xs text-warm-grey mt-2">
                Restricted to authorized field officers, certified testing laboratories, and registry admins.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 border border-rose-200 bg-rose-50 text-rose-700 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@kvic.gov.in"
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                  Passcode / Token
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2 mt-8"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? "Authenticating..." : "Access Dashboard"}</span>
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-12 pt-8 border-t border-charcoal/10">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-4 text-center">
                SIH Judge & Evaluator 1-Click Access
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DEMO_OFFICERS.map((officer, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(officer)}
                    className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster hover:border-gold transition-colors text-left group"
                  >
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-warm-grey font-semibold mb-1">
                      <UserCheck className="w-3 h-3 text-gold" />
                      <span>{officer.role.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs font-serif font-medium text-charcoal truncate">{officer.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
