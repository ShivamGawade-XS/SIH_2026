"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoneyChainLogo from "@/components/HoneyChainLogo";
import confetti from "canvas-confetti";
import {
  UserCheck,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  Building,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export default function RegisterAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cooperative: "KVIC-BH-002",
    role: "FIELD_OFFICER",
  });

  const [step, setStep] = useState<"FORM" | "VERIFY_EMAIL" | "VERIFY_PHONE" | "SUCCESS">("FORM");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setStep("VERIFY_EMAIL");
      } else {
        setErrorMsg(data.error || "Failed to register account");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: emailOtp }),
      });

      const data = await res.json();
      if (res.ok) {
        // If phone was provided, trigger phone OTP
        if (formData.phone && formData.phone.length >= 10) {
          const phoneRes = await fetch("/api/auth/send-phone-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formData.phone }),
          });
          const phoneData = await phoneRes.json();
          if (phoneData.devOtp) setDevOtpHint(phoneData.devOtp);
          setStep("VERIFY_PHONE");
        } else {
          setStep("SUCCESS");
          confetti({ particleCount: 80, spread: 60 });
        }
      } else {
        setErrorMsg(data.error || "Invalid email OTP code");
      }
    } catch (err: any) {
      setErrorMsg("Verification error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          otp: phoneOtp,
          email: formData.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep("SUCCESS");
        confetti({ particleCount: 80, spread: 60 });
      } else {
        setErrorMsg(data.error || "Invalid phone OTP code");
      }
    } catch (err: any) {
      setErrorMsg("Phone verification error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-8 sm:py-20 px-4 sm:px-6 md:px-12 max-w-xl mx-auto w-full flex-1">
        <div className="border-2 border-charcoal/20 bg-white p-5 sm:p-8 md:p-12 shadow-luxury-card">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-charcoal/10">
            <HoneyChainLogo variant="badge" size="md" />
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">KVIC Access Control</p>
              <h1 className="text-2xl sm:text-3xl serif text-charcoal font-normal">Officer & Lab Registration</h1>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 mb-6 border border-rose-300 bg-rose-50 text-rose-800 text-xs font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === "FORM" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label htmlFor="ra-name" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                  Full Name & Designation
                </label>
                <div className="relative">
                  <input
                    id="ra-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajeshwari Sengupta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 border border-charcoal/30 pl-10 pr-3 text-xs focus:border-gold focus:outline-none"
                  />
                  <UserCheck className="w-4 h-4 text-warm-grey absolute left-3 top-4" />
                </div>
              </div>

              <div>
                <label htmlFor="ra-email" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                  Government / Official Email
                </label>
                <div className="relative">
                  <input
                    id="ra-email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    required
                    placeholder="e.g. officer@kvic.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 border border-charcoal/30 pl-10 pr-3 text-xs font-mono focus:border-gold focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-warm-grey absolute left-3 top-4" />
                </div>
              </div>

              <div>
                <label htmlFor="ra-password" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                  Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <input
                    id="ra-password"
                    name="password"
                    autoComplete="new-password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 border border-charcoal/30 pl-10 pr-3 text-xs font-mono focus:border-gold focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-warm-grey absolute left-3 top-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ra-phone" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                    Mobile (for OTP SMS)
                  </label>
                  <div className="relative">
                    <input
                      id="ra-phone"
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 border border-charcoal/30 pl-9 pr-2 text-xs font-mono focus:border-gold focus:outline-none"
                    />
                    <Phone className="w-3.5 h-3.5 text-warm-grey absolute left-3 top-4" />
                  </div>
                </div>

                <div>
                  <label htmlFor="ra-role" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                    Role & Permissions
                  </label>
                  <select
                    id="ra-role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-12 border border-charcoal/30 px-2 text-xs font-bold focus:border-gold focus:outline-none"
                  >
                    <option value="FIELD_OFFICER">Field Officer (KVIC)</option>
                    <option value="LAB_ANALYST">Lab Analyst (NBB)</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ra-cooperative" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                  KVIC / NBB Station Code
                </label>
                <div className="relative">
                  <input
                    id="ra-cooperative"
                    name="cooperative"
                    type="text"
                    required
                    placeholder="e.g. KVIC-WB-009"
                    value={formData.cooperative}
                    onChange={(e) => setFormData({ ...formData, cooperative: e.target.value })}
                    className="w-full h-12 border border-charcoal/30 pl-10 pr-3 text-xs font-mono focus:border-gold focus:outline-none"
                  />
                  <Building className="w-4 h-4 text-warm-grey absolute left-3 top-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <ArrowRight className="w-4 h-4 text-gold" />}
                <span>{loading ? "Creating Officer Account..." : "Register & Send Email OTP"}</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/dashboard/login"
                  className="text-xs text-warm-grey hover:text-charcoal underline"
                >
                  Already have an officer account? Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Email OTP Verification */}
          {step === "VERIFY_EMAIL" && (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 text-xs">
                <p className="text-warm-grey mb-1">
                  We sent a 6-digit verification code to:
                </p>
                <p className="font-mono font-bold text-charcoal">{formData.email}</p>
                <p className="text-[10px] text-warm-grey mt-2">
                  (In dev mode, check terminal/console logs for the generated OTP code)
                </p>
              </div>

              <div>
                <label htmlFor="ra-email-otp" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                  Enter 6-Digit Email OTP
                </label>
                <div className="relative">
                  <input
                    id="ra-email-otp"
                    name="emailOtp"
                    autoComplete="one-time-code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="w-full h-14 border-2 border-charcoal/40 text-center font-mono text-2xl font-bold tracking-widest focus:border-gold focus:outline-none"
                  />
                  <KeyRound className="w-5 h-5 text-warm-grey absolute left-3 top-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <CheckCircle2 className="w-4 h-4 text-gold" />}
                <span>Verify Email Address</span>
              </button>
            </form>
          )}

          {/* STEP 3: Phone OTP Verification */}
          {step === "VERIFY_PHONE" && (
            <form onSubmit={handleVerifyPhone} className="space-y-6">
              <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 text-xs">
                <p className="text-warm-grey mb-1">
                  We sent a SMS verification code to:
                </p>
                <p className="font-mono font-bold text-charcoal">{formData.phone}</p>
                {devOtpHint && (
                  <p className="text-[11px] font-mono text-emerald-800 mt-2 bg-emerald-50 p-2 border border-emerald-300">
                    💡 Dev Mode Auto-OTP: <strong>{devOtpHint}</strong>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ra-phone-otp" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1.5 font-bold">
                  Enter 6-Digit Phone OTP
                </label>
                <input
                  id="ra-phone-otp"
                  name="phoneOtp"
                  autoComplete="one-time-code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="w-full h-14 border-2 border-charcoal/40 text-center font-mono text-2xl font-bold tracking-widest focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <CheckCircle2 className="w-4 h-4 text-gold" />}
                <span>Verify Phone Number</span>
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === "SUCCESS" && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl serif text-charcoal font-bold mb-2">Account Fully Verified</h2>
              <p className="text-xs text-warm-grey max-w-sm mx-auto mb-6">
                Your officer credentials for <strong className="text-charcoal">{formData.email}</strong> have been cryptographically hashed and saved to the database.
              </p>
              <Link
                href="/dashboard/login"
                className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center gap-2"
              >
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
