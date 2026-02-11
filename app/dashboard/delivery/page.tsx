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
import { formatKES } from "@/lib/types";
import { Truck, Package, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

async function fetchDeliveryData() {
  const [deliveries, deliveryOrders] = await Promise.all([
    supabase
      .from("deliveries")
      .select("*, order:orders(*, customer:customers(name, phone))")
      .in("status", ["assigned", "picked_up", "in_transit"])
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("*, customer:customers(name, phone)")
      .eq("order_type", "delivery")
      .in("status", ["ready", "confirmed"])
      .order("created_at", { ascending: true }),
  ]);
  return {
    activeDeliveries: deliveries.data || [],
    pendingPickups: deliveryOrders.data || [],
  };
}

export default function DeliveryDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data } = useSWR("delivery-data", fetchDeliveryData, {
    refreshInterval: 10000,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/staff");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "delivery") {
      router.push("/portal/staff");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid || !data) return null;

  async function pickUpOrder(orderId: string) {
    // Create delivery record
    await supabase.from("deliveries").insert({
      order_id: orderId,
      status: "picked_up",
      pickup_time: new Date().toISOString(),
    });
    await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);
    toast.success("Order picked up! On the way.");
    mutate("delivery-data");
  }

  async function markDelivered(deliveryId: string) {
    await supabase
      .from("deliveries")
      .update({
        status: "delivered",
        delivery_time: new Date().toISOString(),
      })
      .eq("id", deliveryId);
    toast.success("Delivery completed!");
    mutate("delivery-data");
  }

  return (
    <DashboardShell role="delivery" roleLabel="Delivery Staff">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Delivery Dashboard
        </h1>
        <p className="text-muted-foreground">
          Pickups, deliveries, and trip tracking
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Package}
          label="Pending Pickups"
          value={String(data.pendingPickups.length)}
        />
        <StatCard
          icon={Truck}
          label="Active Deliveries"
          value={String(data.activeDeliveries.length)}
        />
        <StatCard
          icon={MapPin}
          label="Total Queue"
          value={String(
            data.pendingPickups.length + data.activeDeliveries.length
          )}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Pickups */}
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="flex items-center gap-2 font-heading text-foreground">
              <Package className="h-5 w-5 text-primary" />
              Ready for Pickup
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            {data.pendingPickups.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No orders waiting for pickup
              </p>
            ) : (
              data.pendingPickups.map((o: any) => (
                <div
                  key={o.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-heading font-bold text-foreground">
                      Order #{o.order_number}
                    </span>
                    <span className="font-medium text-primary">
                      {formatKES(o.total)}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-foreground">
                    {o.customer?.name || "Customer"}
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Tel: {o.customer?.phone || "N/A"}
                  </p>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                    onClick={() => pickUpOrder(o.id)}
                  >
                    <Package className="mr-1 h-4 w-4" />
                    Pick Up Order
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Deliveries */}
        <Card>
          <CardHeader className="bg-mpesa-green/10">
            <CardTitle className="flex items-center gap-2 font-heading text-foreground">
              <Truck className="h-5 w-5 text-mpesa-green" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            {data.activeDeliveries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No active deliveries
              </p>
            ) : (
              data.activeDeliveries.map((d: any) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-mpesa-green/30 bg-mpesa-green/5 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-heading font-bold text-foreground">
                      Order #{d.order?.order_number}
                    </span>
                    <Badge className="bg-mpesa-green text-cream">
                      {d.status}
                    </Badge>
                  </div>
                  <p className="mb-1 text-sm text-foreground">
                    {d.order?.customer?.name || "Customer"}
                  </p>
                  {d.delivery_address && (
                    <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {d.delivery_address}
                    </p>
                  )}
                  <Button
                    className="w-full bg-mpesa-green text-cream hover:bg-mpesa-green/90"
                    size="sm"
                    onClick={() => markDelivered(d.id)}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Mark Delivered
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
