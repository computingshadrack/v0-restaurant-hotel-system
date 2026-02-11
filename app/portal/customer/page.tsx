"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, ArrowLeft, Phone, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Try to find existing customer
    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone.trim())
      .single();

    let customerId: string;

    if (existing) {
      customerId = existing.id;
      // Update visit count
      await supabase
        .from("customers")
        .update({ total_visits: (existing.total_visits || 0) + 1 })
        .eq("id", existing.id);
    } else {
      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from("customers")
        .insert({ name: name.trim(), phone: phone.trim(), total_visits: 1 })
        .select()
        .single();

      if (error || !newCustomer) {
        toast.error("Could not create account. Please try again.");
        setLoading(false);
        return;
      }
      customerId = newCustomer.id;
    }

    sessionStorage.setItem(
      "portal_session",
      JSON.stringify({
        portalType: "customer",
        customerId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
      })
    );

    toast.success("Karibu! Welcome to Savannah Palace");
    router.push("/dashboard/customer");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="overflow-hidden">
          <CardHeader className="bg-primary text-center text-primary-foreground">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <CardTitle className="font-heading text-2xl">
              Karibu Sana!
            </CardTitle>
            <p className="text-sm text-primary-foreground/80">
              Welcome to Savannah Palace Hotel
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-foreground">Your Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="e.g., James Otieno"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    placeholder="07XX XXX XXX"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Connecting..." : "Enter & Explore"}
              </Button>

              <div className="rounded-md bg-mpesa-green/10 p-3 text-center">
                <p className="text-xs text-foreground">
                  New here? Just enter your details!
                </p>
                <p className="mt-1 text-xs font-semibold text-mpesa-green">
                  Fridays = 10% off for loyal customers
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
