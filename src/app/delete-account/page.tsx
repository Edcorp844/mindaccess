"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  User,
  Mail,
  FileText,
  Clock,
  HelpCircle,
} from "lucide-react";

export default function DeleteAccountPage() {
  const { user, logOut } = useAuth();
  const router = useRouter();

  // Self-service state (for logged-in user)
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [deleteReason, setDeleteReason] = useState("No longer need the app");
  const [customReason, setCustomReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Web request form state (for unauthenticated / uninstalled users)
  const [reqEmail, setReqEmail] = useState("");
  const [reqName, setReqName] = useState("");
  const [reqReason, setReqReason] = useState("Uninstalled app / Web request");
  const [reqConfirm, setReqConfirm] = useState(false);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqSuccessTicket, setReqSuccessTicket] = useState<string | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);

  // Active tab for dual mode
  const [activeTab, setActiveTab] = useState<"self" | "form">(
    user ? "self" : "form"
  );

  const handleSelfDelete = async () => {
    if (!user) return;
    if (!confirmChecked) {
      setDeleteError("Please check the confirmation box to proceed.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 2. Call backend deletion API
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          reason: deleteReason === "Other" ? customReason : deleteReason,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to complete account deletion.");
      }

      // 3. Delete Firebase Auth user client-side if possible
      try {
        await user.delete();
      } catch (authDelErr: any) {
        // If reauthentication is needed, the backend already wiped Firestore records.
        console.warn("Client Auth delete notice:", authDelErr);
      }

      // 4. Log out and show success
      await logOut().catch(() => {});
      setDeleteSuccess(true);
    } catch (err: any) {
      console.error("Account deletion error:", err);
      setDeleteError(
        err.message ||
          "Failed to delete account. If you recently logged in, please sign in again and retry, or submit the request form below."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmail || !reqEmail.includes("@")) {
      setReqError("Please enter a valid registered email address.");
      return;
    }
    if (!reqConfirm) {
      setReqError("Please confirm the deletion request acknowledgment.");
      return;
    }

    setIsSubmittingReq(true);
    setReqError(null);

    try {
      const res = await fetch("/api/account/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: reqEmail,
          name: reqName,
          reason: reqReason,
          confirmCheck: reqConfirm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setReqSuccessTicket(data.requestId || "DEL-REQUEST-RECEIVED");
    } catch (err: any) {
      console.error("Request submission error:", err);
      setReqError(
        err.message ||
          "Failed to submit request. Please email privacy@mindaccess.org directly."
      );
    } finally {
      setIsSubmittingReq(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-systemRed selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-systemRed/10 rounded-full blur-[140px] pointer-events-none" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-systemYellow/10 rounded-full blur-[140px] pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        {/* Navigation back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-labelSecondary hover:text-foreground transition-colors mb-10 group"
        >
          <div className="p-2 rounded-full bg-separator/20 group-hover:bg-separator/40 transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold tracking-tight">Back to Home</span>
        </Link>

        {/* Page Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-systemRed/10 text-systemRed text-xs font-black uppercase tracking-wider mb-4 border border-systemRed/20">
            <ShieldAlert className="w-4 h-4" />
            Google Play Data Safety & Deletion
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Delete Account & Data
          </h1>
          <p className="text-lg md:text-xl text-labelSecondary max-w-2xl leading-relaxed">
            You have full sovereignty over your data. Request immediate permanent
            deletion of your MindAccess account and all associated personal information.
          </p>
        </header>

        {/* Success Confirmation Modal / Banner */}
        {deleteSuccess ? (
          <div className="bg-backgroundLayer1 border border-systemGreen/30 rounded-[32px] p-8 md:p-12 shadow-2xl text-center space-y-6 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-systemGreen/20 text-systemGreen flex items-center justify-center mx-auto shadow-xl shadow-systemGreen/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black">Account Successfully Deleted</h2>
            <p className="text-labelSecondary max-w-lg mx-auto leading-relaxed">
              Your MindAccess user account, Firestore profile, and associated personal
              records have been permanently purged from our databases.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/"
                className="px-8 py-3.5 rounded-2xl bg-systemGreen text-white font-bold hover:scale-105 transition-all shadow-lg shadow-systemGreen/30"
              >
                Return to Home
              </Link>
              <Link
                href="/app"
                className="px-8 py-3.5 rounded-2xl bg-separator/20 text-foreground font-bold hover:bg-separator/40 transition-all"
              >
                Browse Directory
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-backgroundLayer1/60 p-1.5 rounded-2xl border border-separator/40 max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab("self")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "self"
                    ? "bg-systemRed text-white shadow-lg shadow-systemRed/20"
                    : "text-labelSecondary hover:text-foreground"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                In-App Self Service
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "form"
                    ? "bg-systemRed text-white shadow-lg shadow-systemRed/20"
                    : "text-labelSecondary hover:text-foreground"
                }`}
              >
                <Mail className="w-4 h-4" />
                Web Request Form
              </button>
            </div>

            {/* TAB 1: SELF-SERVICE DELETION */}
            {activeTab === "self" && (
              <div className="bg-backgroundLayer1 border border-separator/50 rounded-[32px] p-6 md:p-10 shadow-2xl space-y-8">
                {user ? (
                  <>
                    {/* Logged in User Card */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-separator/50">
                      {user.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.photoURL}
                          alt="Avatar"
                          className="w-14 h-14 rounded-full border-2 border-systemRed/40 object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-systemRed/10 border-2 border-systemRed/30 flex items-center justify-center text-systemRed font-black text-lg">
                          {user.displayName?.[0]?.toUpperCase() ||
                            user.email?.[0]?.toUpperCase() ||
                            "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-lg font-black truncate">
                          {user.displayName || "MindAccess User"}
                        </p>
                        <p className="text-sm text-labelSecondary truncate">
                          {user.email}
                        </p>
                        <span className="text-[11px] font-mono text-labelTertiary">
                          UID: {user.uid}
                        </span>
                      </div>
                    </div>

                    {/* What is deleted info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-black flex items-center gap-2 text-systemRed">
                        <AlertTriangle className="w-5 h-5" />
                        What data will be permanently removed?
                      </h3>
                      <ul className="space-y-2 text-sm text-labelSecondary">
                        <li className="flex items-start gap-2">
                          <span className="text-systemRed font-bold">•</span>
                          <span>
                            <strong>Firebase Authentication account:</strong> Email, password
                            hashes, and authentication tokens.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-systemRed font-bold">•</span>
                          <span>
                            <strong>Firestore User Profile:</strong> Display names, roles,
                            and account preferences.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-systemRed font-bold">•</span>
                          <span>
                            <strong>Saved items & Notifications:</strong> Personal center
                            bookmarks, saved searches, and device alert tokens.
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Reason Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-foreground">
                        Why are you deleting your account? (Optional)
                      </label>
                      <select
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-separator text-foreground text-sm font-medium focus:outline-none focus:border-systemRed"
                      >
                        <option value="No longer need the app">
                          I no longer need the application
                        </option>
                        <option value="Found the care/center I needed">
                          I successfully found the care/center I needed
                        </option>
                        <option value="Privacy concerns">Privacy concerns</option>
                        <option value="Too many notifications/emails">
                          Too many notifications / alerts
                        </option>
                        <option value="Other">Other reason</option>
                      </select>
                      {deleteReason === "Other" && (
                        <input
                          type="text"
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Please specify..."
                          className="w-full px-4 py-3 rounded-xl bg-background border border-separator text-foreground text-sm focus:outline-none focus:border-systemRed mt-2"
                        />
                      )}
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="p-4 rounded-2xl bg-systemRed/5 border border-systemRed/20 space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmChecked}
                          onChange={(e) => setConfirmChecked(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-systemRed text-systemRed focus:ring-systemRed"
                        />
                        <span className="text-sm font-medium text-foreground leading-snug">
                          I understand that this action is <strong>permanent</strong> and
                          cannot be undone. All my account data, profile details, and
                          preferences will be purged.
                        </span>
                      </label>
                    </div>

                    {deleteError && (
                      <div className="p-4 rounded-xl bg-systemRed/10 border border-systemRed text-systemRed text-sm font-medium">
                        {deleteError}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="button"
                        disabled={isDeleting || !confirmChecked}
                        onClick={handleSelfDelete}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition-all ${
                          confirmChecked && !isDeleting
                            ? "bg-systemRed hover:bg-systemRed/90 hover:scale-[1.02] shadow-xl shadow-systemRed/30"
                            : "bg-systemRed/40 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Deleting Data...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-5 h-5" />
                            Permanently Delete My Account
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/app")}
                        className="py-4 px-6 rounded-2xl bg-separator/20 hover:bg-separator/40 text-foreground font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  /* Not logged in banner */
                  <div className="text-center py-8 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-systemYellow/10 text-systemYellow flex items-center justify-center mx-auto">
                      <User className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black">You are not currently signed in</h3>
                      <p className="text-labelSecondary max-w-md mx-auto text-sm">
                        Sign in to automatically verify your identity and delete your account in
                        one click, or use the <strong>Web Request Form</strong> below if you have
                        already uninstalled the app.
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-2">
                      <Link
                        href="/login"
                        className="px-6 py-3 rounded-xl bg-systemGreen text-white font-bold hover:scale-105 transition-all shadow-lg shadow-systemGreen/20"
                      >
                        Sign In First
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveTab("form")}
                        className="px-6 py-3 rounded-xl bg-separator/20 hover:bg-separator/40 font-bold transition-all"
                      >
                        Use Request Form
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WEB DELETION REQUEST FORM (Play Store requirement for uninstalled users) */}
            {activeTab === "form" && (
              <div className="bg-backgroundLayer1 border border-separator/50 rounded-[32px] p-6 md:p-10 shadow-2xl space-y-8">
                {reqSuccessTicket ? (
                  <div className="text-center py-6 space-y-6 animate-scale-in">
                    <div className="w-16 h-16 rounded-full bg-systemGreen/20 text-systemGreen flex items-center justify-center mx-auto shadow-lg shadow-systemGreen/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black">Deletion Request Received</h3>
                      <p className="text-labelSecondary max-w-md mx-auto text-sm leading-relaxed">
                        We have logged your request. All records associated with your email
                        address will be purged within 48 to 72 hours.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-separator inline-block text-center font-mono">
                      <span className="text-xs text-labelTertiary block uppercase tracking-wider">
                        Tracking Reference ID
                      </span>
                      <span className="text-lg font-black text-systemGreen">
                        {reqSuccessTicket}
                      </span>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReqSuccessTicket(null);
                          setReqEmail("");
                          setReqConfirm(false);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-separator/20 hover:bg-separator/40 text-sm font-bold transition-all"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black flex items-center gap-2">
                        <Mail className="w-6 h-6 text-systemGreen" />
                        Web Account Deletion Request
                      </h3>
                      <p className="text-sm text-labelSecondary">
                        If you cannot log in or have uninstalled the application, submit this
                        form to request manual account and data deletion under Google Play policies.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-labelSecondary mb-2">
                          Registered Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={reqEmail}
                          onChange={(e) => setReqEmail(e.target.value)}
                          placeholder="e.g. user@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-separator text-foreground text-sm focus:outline-none focus:border-systemGreen font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-labelSecondary mb-2">
                          Account Name / Display Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-separator text-foreground text-sm focus:outline-none focus:border-systemGreen font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-labelSecondary mb-2">
                          Reason for Request (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={reqReason}
                          onChange={(e) => setReqReason(e.target.value)}
                          placeholder="Please provide any relevant details..."
                          className="w-full px-4 py-3 rounded-xl bg-background border border-separator text-foreground text-sm focus:outline-none focus:border-systemGreen font-medium resize-none"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-background border border-separator space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reqConfirm}
                            onChange={(e) => setReqConfirm(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-systemGreen text-systemGreen focus:ring-systemGreen"
                          />
                          <span className="text-xs font-medium text-foreground leading-snug">
                            I certify that I am the account owner or authorized representative
                            requesting complete deletion of all personal information and account
                            records associated with this email address.
                          </span>
                        </label>
                      </div>
                    </div>

                    {reqError && (
                      <div className="p-4 rounded-xl bg-systemRed/10 border border-systemRed text-systemRed text-sm font-medium">
                        {reqError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingReq || !reqConfirm}
                      className={`w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition-all ${
                        reqConfirm && !isSubmittingReq
                          ? "bg-systemGreen hover:bg-systemGreen/90 hover:scale-[1.01] shadow-xl shadow-systemGreen/30"
                          : "bg-systemGreen/40 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {isSubmittingReq ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Submit Deletion Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* POLICY & FAQ SECTION */}
            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-backgroundLayer1/40 border border-separator/30 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-systemGreen/10 text-systemGreen flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Processing Time</h4>
                <p className="text-xs text-labelSecondary leading-relaxed">
                  In-app self-service deletions occur instantly. Web request submissions are
                  processed within 48 to 72 business hours.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-backgroundLayer1/40 border border-separator/30 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-systemGreen/10 text-systemGreen flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Data Types Purged</h4>
                <p className="text-xs text-labelSecondary leading-relaxed">
                  Authentication tokens, Firestore documents, center submission records, bookmarks,
                  and notifications are permanently scrubbed.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-backgroundLayer1/40 border border-separator/30 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-systemGreen/10 text-systemGreen flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Need Assistance?</h4>
                <p className="text-xs text-labelSecondary leading-relaxed">
                  Have questions about your data? Contact our Data Protection Officer at{" "}
                  <a
                    href="mailto:privacy@mindaccess.org"
                    className="text-systemGreen font-bold underline"
                  >
                    privacy@mindaccess.org
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <footer className="mt-16 text-center text-labelSecondary text-xs font-medium border-t border-separator/30 pt-8">
          <p>
            MindAccess &bull; In compliance with Google Play Data Safety Requirements & Data Protection
            Regulations &bull; &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
