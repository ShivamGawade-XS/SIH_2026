"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEMO_OFFICERS } from "@/lib/auth-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, XCircle } from "lucide-react";

const DEMO_USERS = [
  { initials: "AR", shortName: "Dr. Ananya", role: "Field Officer", idx: 0 },
  { initials: "KN", shortName: "K.S. Narayanan", role: "Lab Analyst", idx: 1 },
  { initials: "SG", shortName: "Shivam G.", role: "Admin", idx: 2 },
];

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass  = customPass  || password;

    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed.");
      } else {
        const searchParams   = new URLSearchParams(window.location.search);
        const fromParam      = searchParams.get("from");
        const safeDestination =
          fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//") && !fromParam.includes(":")
            ? fromParam
            : "/dashboard";
        window.location.href = `${safeDestination}${safeDestination.includes("?") ? "&" : "?"}ts=${Date.now()}`;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (idx: number) => {
    const officer = DEMO_OFFICERS[idx];
    if (!officer) return;
    setEmail(officer.email);
    setPassword(officer.password);
    handleLogin(undefined, officer.email, officer.password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-amber rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Officer Portal</h1>
          <p className="text-sm text-text-muted mt-1">Authorized personnel only.</p>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login form */}
        <Card className="bg-surface border-border">
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-text-secondary">Official Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="officer@kvic.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-text-secondary">Passcode</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-brand-amber hover:bg-brand-amber-light text-black font-semibold mt-2"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo access */}
        <div className="mt-6">
          <Separator className="bg-border mb-4" />
          <p className="text-xs text-text-muted text-center mb-3">SIH Evaluator Demo Access</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((user) => (
              <Button
                key={user.role}
                variant="outline"
                size="sm"
                className="border-border text-text-secondary hover:border-brand-amber hover:text-text-primary flex-col h-auto py-3 text-xs gap-1"
                onClick={() => handleDemoLogin(user.idx)}
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs bg-surface-raised text-text-primary">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium leading-none">{user.shortName}</span>
                <span className="text-text-muted text-[10px] leading-none">{user.role}</span>
              </Button>
            ))}
          </div>
        </div>

        <p className="text-center mt-6">
          <Link
            href="/dashboard/register-account"
            className="text-xs text-text-muted hover:text-brand-amber transition-colors"
          >
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
}
