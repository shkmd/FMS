"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@fms/shared";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  React.useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
            AF
          </div>
          <CardTitle className="text-xl">Athachi Farms</CardTitle>
          <CardDescription>Sign in to the Farm Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@athachifarms.demo" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-3 text-center text-xs">
            <Link href="/reset-password" className="text-primary underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo credentials: any seeded user email · password <code>Demo@1234</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
