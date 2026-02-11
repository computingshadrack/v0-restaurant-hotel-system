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
import { ChefHat, Clock, Flame, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

async function fetchKitchenOrders() {
  const { data } = await supabase
    .from("orders")
    .select(
      "*, customer:customers(name), order_items(*, menu_item:menu_items(name, preparation_time, category))"
    )
    .in("status", ["pending", "confirmed", "preparing"])
    .order("created_at", { ascending: true });
  return data || [];
}

export default function KitchenDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data: orders } = useSWR("kitchen-orders", fetchKitchenOrders, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/staff");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "kitchen") {
      router.push("/portal/staff");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid) return null;

  const allOrders = orders || [];
  const pendingOrders = allOrders.filter(
    (o: any) => o.status === "pending" || o.status === "confirmed"
  );
  const preparingOrders = allOrders.filter(
    (o: any) => o.status === "preparing"
  );

  async function startPreparing(orderId: string) {
    await supabase
      .from("orders")
      .update({ status: "preparing" })
      .eq("id", orderId);
    toast.success("Started preparing order");
    mutate("kitchen-orders");
  }

  async function markReady(orderId: string) {
    await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", orderId);
    toast.success("Order ready for pickup!");
    mutate("kitchen-orders");
  }

  return (
    <DashboardShell role="kitchen" roleLabel="Kitchen Staff">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Kitchen Display
        </h1>
        <p className="text-muted-foreground">
          Order queue and preparation status
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Pending"
          value={String(pendingOrders.length)}
        />
        <StatCard
          icon={Flame}
          label="Preparing"
          value={String(preparingOrders.length)}
        />
        <StatCard
          icon={ChefHat}
          label="Total Queue"
          value={String(allOrders.length)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Queue */}
        <Card>
          <CardHeader className="bg-earth-red/10">
            <CardTitle className="flex items-center gap-2 font-heading text-foreground">
              <Clock className="h-5 w-5 text-earth-red" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            {pendingOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No pending orders
              </p>
            ) : (
              pendingOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-heading font-bold text-foreground">
                      Order #{o.order_number}
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {o.order_type?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {o.customer?.name || "Walk-in"}
                  </p>
                  <div className="mb-3 flex flex-col gap-1">
                    {o.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {item.quantity}x {item.menu_item?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ~{item.menu_item?.preparation_time || 15}min
                        </span>
                      </div>
                    ))}
                  </div>
                  {o.notes && (
                    <p className="mb-2 rounded bg-primary/10 p-2 text-xs text-primary">
                      Note: {o.notes}
                    </p>
                  )}
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                    onClick={() => startPreparing(o.id)}
                  >
                    <Flame className="mr-1 h-4 w-4" />
                    Start Preparing
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Preparing */}
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="flex items-center gap-2 font-heading text-foreground">
              <Flame className="h-5 w-5 text-primary" />
              Currently Preparing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            {preparingOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing being prepared
              </p>
            ) : (
              preparingOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-primary/30 bg-primary/5 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-heading font-bold text-foreground">
                      Order #{o.order_number}
                    </span>
                    <Badge className="bg-primary text-primary-foreground">
                      Preparing
                    </Badge>
                  </div>
                  <div className="mb-3 flex flex-col gap-1">
                    {o.order_items?.map((item: any) => (
                      <div key={item.id} className="text-sm text-foreground">
                        {item.quantity}x {item.menu_item?.name}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-mpesa-green text-cream hover:bg-mpesa-green/90"
                    size="sm"
                    onClick={() => markReady(o.id)}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Mark Ready
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
