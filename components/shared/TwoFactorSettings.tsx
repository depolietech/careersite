"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Smartphone, Mail, Copy, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Method = "totp" | "email";
type SetupStep = "choose" | "totp-qr" | "email-confirm" | "backup-codes" | "disabled";

interface Status {
  enabled: boolean;
  method: Method | null;
}

export function TwoFactorSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep | null>(null);
  const [method, setMethod] = useState<Method>("totp");

  // TOTP setup
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Code confirmation
  const [verifyCode, setVerifyCode] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codesCopied, setCodesCopied] = useState(false);

  // Disable 2FA
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisablePass, setShowDisablePass] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/2fa/status")
      .then((r) => r.json())
      .then((d) => setStatus({ enabled: d.enabled, method: d.method }));
  }, []);

  async function startSetup() {
    setSetupStep("choose");
    setSetupError(null);
  }

  async function continueSetup() {
    setSetupLoading(true);
    setSetupError(null);
    try {
      if (method === "totp") {
        const res = await fetch(`/api/auth/2fa/setup?method=totp`);
        const data = await res.json();
        setQrDataUrl(data.qrDataUrl);
        setTotpSecret(data.secret);
        setSetupStep("totp-qr");
      } else {
        // Send email OTP for setup
        await fetch("/api/auth/2fa/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "2fa_setup" }),
        });
        setOtpSent(true);
        // Also notify the setup endpoint to use email method
        await fetch("/api/auth/2fa/setup?method=email");
        setSetupStep("email-confirm");
      }
    } catch {
      setSetupError("Failed to start setup. Try again.");
    } finally {
      setSetupLoading(false);
    }
  }

  async function confirmSetup() {
    setSetupLoading(true);
    setSetupError(null);
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      setBackupCodes(data.backupCodes ?? []);
      setSetupStep("backup-codes");
      setStatus({ enabled: true, method });
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleDisable() {
    setDisableLoading(true);
    setDisableError(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to disable");
      setStatus({ enabled: false, method: null });
      setShowDisable(false);
      setDisablePassword("");
      setSetupStep(null);
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : "Failed");
    } finally {
      setDisableLoading(false);
    }
  }

  function copySecret() {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  }

  function copyCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2000);
  }

  if (!status) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <ShieldCheck size={16} className="text-brand-600" aria-hidden="true" />
          </div>
          <h2 className="font-semibold text-gray-900">Two-Factor Authentication</h2>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          status.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {status.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <p className="text-sm text-gray-500">
        Add an extra layer of security to your account. When enabled, you&apos;ll need a code in addition to your password.
      </p>

      {status.enabled && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <ShieldCheck size={15} aria-hidden="true" />
          2FA is active via <strong>{status.method === "totp" ? "Authenticator App" : "Email code"}</strong>
        </div>
      )}

      {/* ── Backup codes view ── */}
      {setupStep === "backup-codes" && (
        <div className="space-y-4 rounded-xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Save your backup codes — they won&apos;t be shown again
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {backupCodes.map((c) => (
              <code key={c} className="text-xs font-mono bg-white border border-amber-200 rounded px-2 py-1 text-center">
                {c}
              </code>
            ))}
          </div>
          <button
            type="button"
            onClick={copyCodes}
            className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
            aria-label="Copy backup codes to clipboard"
          >
            {codesCopied ? <Check size={14} /> : <Copy size={14} />}
            {codesCopied ? "Copied!" : "Copy all codes"}
          </button>
          <Button onClick={() => setSetupStep(null)} size="sm">
            Done — I&apos;ve saved my codes
          </Button>
        </div>
      )}

      {/* ── Method chooser ── */}
      {setupStep === "choose" && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Choose a method:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "totp" as Method, icon: Smartphone, title: "Authenticator App", desc: "Google Authenticator, Microsoft Authenticator, etc." },
              { id: "email" as Method, icon: Mail, title: "Email code", desc: "We'll send a code to your email each time." },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                aria-pressed={method === m.id}
                className={`text-left rounded-xl border-2 p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  method === m.id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <m.icon size={16} className={method === m.id ? "text-brand-600 mb-1" : "text-gray-400 mb-1"} aria-hidden="true" />
                <p className="text-xs font-semibold text-gray-900">{m.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{m.desc}</p>
              </button>
            ))}
          </div>
          {setupError && <p role="alert" className="text-sm text-red-600">{setupError}</p>}
          <div className="flex gap-2">
            <Button onClick={continueSetup} loading={setupLoading} size="sm">Continue</Button>
            <Button variant="secondary" size="sm" onClick={() => setSetupStep(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── TOTP QR ── */}
      {setupStep === "totp-qr" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, etc.):
          </p>
          {qrDataUrl && (
            <div className="flex justify-center">
              <Image src={qrDataUrl} alt="Authenticator QR code" width={160} height={160} className="rounded-xl border border-gray-200" />
            </div>
          )}
          {totpSecret && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-gray-700 break-all">{totpSecret}</code>
              <button
                type="button"
                onClick={copySecret}
                aria-label="Copy secret key"
                className="shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
              >
                {secretCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="totp-verify" className="block text-sm font-medium text-gray-700">
              Enter the 6-digit code from your app to confirm:
            </label>
            <input
              id="totp-verify"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="000000"
              className="input text-center font-mono text-lg tracking-widest"
              autoComplete="one-time-code"
            />
          </div>
          {setupError && <p role="alert" className="text-sm text-red-600">{setupError}</p>}
          <div className="flex gap-2">
            <Button onClick={confirmSetup} loading={setupLoading} disabled={verifyCode.length < 6} size="sm">
              Confirm & enable
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSetupStep(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Email OTP confirm ── */}
      {setupStep === "email-confirm" && (
        <div className="space-y-4">
          {otpSent && (
            <div role="status" className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              A 6-digit code was sent to your email.
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email-verify" className="block text-sm font-medium text-gray-700">
              Enter the code to confirm:
            </label>
            <input
              id="email-verify"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="000000"
              className="input text-center font-mono text-lg tracking-widest"
              autoComplete="one-time-code"
            />
          </div>
          {setupError && <p role="alert" className="text-sm text-red-600">{setupError}</p>}
          <div className="flex gap-2">
            <Button onClick={confirmSetup} loading={setupLoading} disabled={verifyCode.length < 6} size="sm">
              Confirm & enable
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSetupStep(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Disable modal ── */}
      {showDisable && (
        <div className="space-y-4 rounded-xl bg-red-50 border border-red-100 p-4">
          <p className="text-sm font-semibold text-red-900">Confirm password to disable 2FA</p>
          <div className="relative">
            <input
              type={showDisablePass ? "text" : "password"}
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Current password"
              className="input pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowDisablePass((s) => !s)}
              aria-label={showDisablePass ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showDisablePass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {disableError && <p role="alert" className="text-sm text-red-600">{disableError}</p>}
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDisable} loading={disableLoading} size="sm">Disable 2FA</Button>
            <Button variant="secondary" size="sm" onClick={() => { setShowDisable(false); setDisablePassword(""); setDisableError(null); }}>
              <X size={14} aria-hidden="true" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      {!setupStep && !showDisable && (
        status.enabled ? (
          <Button variant="danger" type="button" size="sm" onClick={() => setShowDisable(true)}>
            Disable 2FA
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={startSetup}>
            Enable 2FA
          </Button>
        )
      )}
    </div>
  );
}
