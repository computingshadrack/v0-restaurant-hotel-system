"use client";

import Link from "next/link";
import { ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function CustomerHeader({
  customerName,
  cartCount,
  onCartClick,
}: {
  customerName: string;
  cartCount: number;
  onCartClick: () => void;
}) {
  const router = useRouter();

  function handleLogout() {
    sessionStorage.removeItem("portal_session");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-heading text-lg font-bold text-primary">
            Savannah Palace
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            | Karibu, {customerName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCartClick}
            className="relative bg-transparent"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-earth-red p-0 text-xs text-cream">
                {cartCount}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
