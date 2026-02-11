"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKES } from "@/lib/types";
import { ClipboardList, Clock, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

async function fetchWaitstaffData() {
  const [orders, ratings] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "*, customer:customers(name), order_items(*, menu_item:menu_items(name))"
      )
      .in("status", ["pending", "confirmed", "preparing", "ready", "served"])
      .order("created_at", { ascending: true }),
    supabase
      .from("ratings")
      .select("*, customer:customers(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  return {
    orders: orders.data || [],
    ratings: ratings.data || [],
  };
}

export default function WaitstaffDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data } = useSWR("waitstaff-data", fetchWaitstaffData, {
    refreshInterval: 10000,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/staff");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "waitstaff") {
      router.push("/portal/staff");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid || !data) return null;

  async function markServed(orderId: string) {
    await supabase
      .from("orders")
      .update({ status: "served" })
      .eq("id", orderId);
    toast.success("Order marked as served!");
    mutate("waitstaff-data");
  }

  const pendingCount = data.orders.filter(
    (o: any) => o.status === "pending" || o.status === "confirmed"
  ).length;
  const readyCount = data.orders.filter(
    (o: any) => o.status === "ready"
  ).length;

  return (
    <DashboardShell role="waitstaff" roleLabel="Waitstaff">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Waitstaff Dashboard
        </h1>
        <p className="text-muted-foreground">
          Active orders and service management
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Active Orders"
          value={String(data.orders.length)}
        />
        <StatCard
          icon={Clock}
          label="Waiting to Serve"
          value={String(pendingCount)}
        />
        <StatCard
          icon={CheckCircle}
          label="Ready for Pickup"
          value={String(readyCount)}
        />
        <StatCard
          icon={Star}
          label="Recent Ratings"
          value={String(data.ratings.length)}
        />
      </div>

      {/* Active Orders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Active Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((o: any) => (
                <TableRow
                  key={o.id}
                  className={o.status === "ready" ? "bg-mpesa-green/5" : ""}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.order_number}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {o.customer?.name || "Walk-in"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.order_items
                      ?.map(
                        (i: any) =>
                          `${i.quantity}x ${i.menu_item?.name || "Item"}`
                      )
                      .join(", ") || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatKES(o.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        o.status === "ready"
                          ? "bg-mpesa-green text-cream"
                          : o.status === "preparing"
                            ? "bg-primary text-primary-foreground"
                            : ""
                      }
                      variant="secondary"
                    >
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {o.status === "ready" && (
                      <Button
                        size="sm"
                        className="h-7 bg-mpesa-green text-xs text-cream hover:bg-mpesa-green/90"
                        onClick={() => markServed(o.id)}
                      >
                        Serve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Customer Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {data.ratings.map((r: any) => (
              <div
                key={r.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < r.rating
                          ? "fill-primary text-primary"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {r.customer?.name || "Anonymous"}
                  </p>
                  {r.comment && (
                    <p className="text-xs text-muted-foreground">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {data.ratings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No ratings yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
