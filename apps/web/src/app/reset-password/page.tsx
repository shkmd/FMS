"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [step, setStep] = React.useState<"request" | "reset">(tokenFromUrl ? "reset" : "request");
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState(tokenFromUrl);
  const [newPassword, setNewPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const requestReset = async () => {
    setError(null);
    try {
      await api.post("/auth/request-password-reset", { email });
      setMessage("If that email exists, a reset link has been sent (check the API server console in this demo environment).");
      setStep("reset");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  const resetPassword = async () => {
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setMessage("Password updated. You can sign in now.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Reset link is invalid or expired");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            {step === "request" ? "Enter your account email to receive a reset link." : "Enter the reset token and your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {message && <p className="rounded-md bg-primary/10 p-2 text-sm">{message}</p>}
          {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}

          {step === "request" ? (
            <>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button className="w-full" onClick={requestReset} disabled={!email}>Send reset link</Button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label>Reset token</Label>
                <Input value={token} onChange={(e) => setToken(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>New password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <Button className="w-full" onClick={resetPassword} disabled={!token || newPassword.length < 8}>Set new password</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// useSearchParams() opts the page out of static rendering unless wrapped in Suspense — without
// this, `next build` fails to prerender the page at all.
export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
