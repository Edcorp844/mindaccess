"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;

  const strength = checks.filter((c) => c.ok).length;
  const colors = ["bg-systemRed", "bg-systemOrange", "bg-systemYellow", "bg-systemGreen"];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength] : "bg-fillSecondary"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-[10px] font-semibold flex items-center gap-1 ${c.ok ? "text-systemGreen" : "text-labelTertiary"}`}>
            <CheckCircle className="w-3 h-3" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { signUp, signInWithGoogle, signInWithApple, user, loading, error, clearError } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/app");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setConfirmError("");

    if (password !== confirm) {
      setConfirmError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setConfirmError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, displayName);
      router.replace("/app");
    } catch {
      // error is set by context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
      router.replace("/app");
    } catch {
      // error is set by context
    } finally {
      setSubmitting(false);
    }
  };

  const handleApple = async () => {
    clearError();
    setSubmitting(true);
    try {
      await signInWithApple();
      router.replace("/app");
    } catch {
      // error is set by context
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-systemGreen border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-systemGreen/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-systemPurple/10 blur-[120px] animate-pulse-slow [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-background/70 backdrop-blur-xl border border-separator flex items-center justify-center shadow-[0_0_20px_rgba(3,161,14,0.2)] group-hover:shadow-[0_0_35px_rgba(3,161,14,0.4)] transition-all p-2">
            <svg viewBox="0 0 490.1 490.1" className="w-full h-full fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M177.05,0c-26.4,0-48.2,21.8-51.3,49.8c12.9,2.1,24.9,53.3,25.7,72.7c0,5.4-4.3,10.1-9.7,10.1h-0.4c-5.4,0-9.7-4.3-10.1-9.7c0.2-26.6-16-60.3-17.2-65.1c-3.3-0.7-6.8-1.4-10.4-1.4c-24.6,0-45.1,18.8-50.5,44.2c5,5.8,17.7,19.1,41.2,27c20,6.8,41.6,8.9,63,7.8c5.4,0,10.1,3.9,10.5,9.3c0.4,5.4-3.9,10.1-9.3,10.5c-19.2,1.7-50.2-2.7-69.6-8.6c-6.2-1.9-28-6.1-48.5-31.8c-23.2,6.9-40.2,29.4-40.2,56.7c0,9.4,2,18.4,5.8,26.5c54.9-6.4,85.4-4.4,96.9-1.3c29.9,8.2,55.2,25.7,64.9,37.3c3.5,4.3,3.1,10.5-1.2,14c-1.9,1.6-8.6,5-14-1.2c-13.5-15.6-44.7-28.4-54.4-30.7c-17.9-4.2-67.6-0.5-92.4,2.1c-3.5,7.9-5.6,16.9-5.6,26.3c0,9.1,1.9,17.6,5.4,25.1c48.6,8.8,69.6-10.4,80.1-17c5.8-3.9,12.1-7.8,18.3-11.3c4.7-2.7,10.9-0.8,13.6,3.9c2.7,4.7,0.8,10.9-3.9,13.6c-5.8,3.1-11.3,6.6-16.7,10.5c-11.3,7.4-37.5,28.7-90.2,21.2c-4.2,8.3-6.7,17.9-6.7,27.8c0,26.9,17.1,49.6,40,55.8c18.3-23.5,45.5-53.3,110.5-46.4c11.7,1.2,21.8,6.2,29.2,12.8c4.3,3.5,4.7,10.1,0.8,14c-3.5,4.3-10.1,4.7-14,0.8c-5-4.3-11.3-6.3-16.5-7.3c4.5,1.5,7.4,6,6.8,10.8l-2.7,19.8c-2.3,17.1-5.8,40.8-21,56.8c-1.9,1.9-4.7,3.1-7.4,3.1c-0.4,0-0.4,0-0.8,0c2.7,28.8,24.9,51.3,51.7,51.3c28.8,0,51.7-25.7,51.7-57.2s0-344.2,0-375.7C229.25,25.7,205.85,0,177.05,0z"/>
              <path d="M261.65,57.2c0,31.5,0,344.2,0,375.7s22.9,57.2,51.7,57.2c26.8,0,49-22.6,51.7-51.3c-0.4,0-0.4,0-0.8,0c-2.7,0-5.4-1.2-7.4-3.1c-15.2-15.9-18.7-39.7-21-56.8l-2.7-19.8c-0.7-4.8,2.3-9.3,6.8-10.8c-5.1,1-11.5,3-16.5,7.3c-3.9,3.9-10.5,3.5-14-0.8c-3.9-3.9-3.5-10.5,0.8-14c7.4-6.6,17.5-11.6,29.2-12.8c65.1-6.8,92.3,22.9,110.5,46.4c22.9-6.2,40-28.9,40-55.8c0-10-2.4-19.6-6.7-27.8c-52.7,7.5-78.9-13.8-90.2-21.2c-5.4-3.9-10.9-7.4-16.7-10.5c-4.7-2.7-6.6-8.9-3.9-13.6c2.7-4.7,8.9-6.6,13.6-3.9c6.2,3.5,12.4,7.4,18.3,11.3c10.5,6.6,31.6,25.7,80.1,17c3.5-7.6,5.4-16,5.4-25.1c0-9.3-2.2-18.4-5.6-26.3c-24.7-2.6-74.5-6.3-92.4-2.1c-9.7,2.3-40.9,15.1-54.4,30.7c-5.4,6.2-12.1,2.7-14,1.2c-4.3-3.5-4.7-9.7-1.2-14c9.7-11.7,35.1-29.1,64.9-37.3c11.5-3.2,42-5.2,96.9,1.3c3.7-8.1,5.8-17.1,5.8-26.5c0-27.3-17-49.8-40.2-56.7c-20.4,25.7-42.2,29.8-48.5,31.8c-19.4,5.8-50.5,10.3-69.6,8.6c-5.4-0.4-9.7-5.1-9.3-10.5c0.4-5.4,5.1-9.3,10.5-9.3c21.4,1.2,43-1,63-7.8c23.5-7.9,36.2-21.2,41.2-27c-5.4-25.4-25.9-44.2-50.5-44.2c-3.6,0-7.1,0.7-10.4,1.4c-1.2,4.9-17.4,38.5-17.2,65.1c-0.4,5.4-4.7,9.7-10.1,9.7h-0.4c-5.4,0-9.7-4.7-9.7-10.1c0.8-19.4,12.8-70.7,25.7-72.7c-3.1-28.3-24.9-50.1-51.3-50.1C284.25,0,260.95,25.7,261.65,57.2z"/>
            </svg>
          </div>
          <span className="font-black text-2xl tracking-tighter">Mind<span className="text-systemGreen">Access</span></span>
        </Link>

        {/* Card */}
        <div className="glass rounded-[32px] p-8 md:p-10 shadow-2xl shadow-foreground/5 border border-separator/50">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">Create account</h1>
            <p className="text-labelSecondary mt-2 text-sm">Join MindAccess and help connect Uganda to care.</p>
          </div>

          {/* Error Banner */}
          {(error || confirmError) && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-systemRed/10 border border-systemRed/20 mb-6 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-systemRed shrink-0 mt-0.5" />
              <p className="text-sm text-systemRed font-medium">{confirmError || error}</p>
            </div>
          )}

          {/* Google + Apple */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              id="google-register-btn"
              onClick={handleGoogle}
              disabled={submitting}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-separator/80 bg-fillTertiary hover:bg-fillSecondary transition-all font-semibold text-sm disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              <FcGoogle className="w-5 h-5 shrink-0" />
              <span>Google</span>
            </button>
            <button
              id="apple-register-btn"
              onClick={handleApple}
              disabled={submitting}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-separator/80 bg-fillTertiary hover:bg-fillSecondary transition-all font-semibold text-sm disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              <SiApple className="w-5 h-5 shrink-0" />
              <span>Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-separator/50" />
            <span className="text-xs text-labelTertiary font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-separator/50" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1">
              <label htmlFor="displayName" className="text-xs font-black uppercase tracking-widest text-labelTertiary">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-labelTertiary" />
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-fillTertiary border border-separator/50 focus:border-systemGreen focus:ring-2 focus:ring-systemGreen/20 outline-none transition-all text-sm placeholder:text-labelQuaternary"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-xs font-black uppercase tracking-widest text-labelTertiary">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-labelTertiary" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-fillTertiary border border-separator/50 focus:border-systemGreen focus:ring-2 focus:ring-systemGreen/20 outline-none transition-all text-sm placeholder:text-labelQuaternary"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="reg-password" className="text-xs font-black uppercase tracking-widest text-labelTertiary">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-labelTertiary" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-fillTertiary border border-separator/50 focus:border-systemGreen focus:ring-2 focus:ring-systemGreen/20 outline-none transition-all text-sm placeholder:text-labelQuaternary"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-labelTertiary hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-widest text-labelTertiary">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-labelTertiary" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-fillTertiary border outline-none transition-all text-sm placeholder:text-labelQuaternary ${
                    confirm && password !== confirm
                      ? "border-systemRed/50 focus:ring-2 focus:ring-systemRed/20"
                      : "border-separator/50 focus:border-systemGreen focus:ring-2 focus:ring-systemGreen/20"
                  }`}
                />
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-systemRed font-semibold mt-1">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-systemGreen text-white font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-systemGreen/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {submitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-labelSecondary mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-systemGreen hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
