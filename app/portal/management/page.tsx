"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManagementLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"portal" | "role">("portal");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");

  function handlePortalLogin(e: React.FormEvent) {
    e.preventDefault();
    if (
      username === "kenya_management" &&
      password === "hospitality2024"
    ) {
      setStep("role");
      setError("");
    } else {
      setError("Invalid portal credentials");
    }
  }

  function handleRoleSelect(role: string) {
    setSelectedRole(role);
    // Store session in sessionStorage
    sessionStorage.setItem(
      "portal_session",
      JSON.stringify({ portalType: "management", role })
    );
    router.push(`/dashboard/${role}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-secondary-foreground/70 hover:text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-savannah-gold/20">
          <CardHeader className="bg-secondary text-center rounded-t-lg">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-savannah-gold/20">
              <Building2 className="h-7 w-7 text-savannah-gold" />
            </div>
            <CardTitle className="font-heading text-2xl text-secondary-foreground">
              Management Portal
            </CardTitle>
            <p className="text-sm text-secondary-foreground/60">
              {step === "portal"
                ? "Enter portal credentials to continue"
                : "Select your role to proceed"}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {step === "portal" ? (
              <form onSubmit={handlePortalLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username" className="text-foreground">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      placeholder="Portal username"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Portal password"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Access Portal
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Default: kenya_management / hospitality2024
                </p>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  {
                    role: "admin",
                    label: "Administrator",
                    desc: "Full system control and reporting",
                  },
                  {
                    role: "manager",
                    label: "Manager",
                    desc: "Operations and staff management",
                  },
                  {
                    role: "receptionist",
                    label: "Receptionist",
                    desc: "Bookings, check-in/out, payments",
                  },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => handleRoleSelect(item.role)}
                    className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
                  >
                    <span className="font-heading font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
