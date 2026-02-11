"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKES } from "@/lib/types";
import {
  DollarSign,
  Users,
  Bed,
  UtensilsCrossed,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

const supabase = createClient();

async function fetchStats() {
  const [orders, staff, rooms, customers] = await Promise.all([
    supabase.from("orders").select("id, total, status, created_at, payment_status"),
    supabase.from("staff").select("*").eq("is_active", true),
    supabase.from("rooms").select("id, status"),
    supabase.from("customers").select("id"),
  ]);
  return {
    orders: orders.data || [],
    staff: staff.data || [],
    rooms: rooms.data || [],
    customers: customers.data || [],
  };
}

async function fetchRecentOrders() {
  const { data } = await supabase
    .from("orders")
    .select("*, customer:customers(name)")
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data: stats } = useSWR("admin-stats", fetchStats);
  const { data: recentOrders } = useSWR("recent-orders", fetchRecentOrders);

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/management");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "admin") {
      router.push("/portal/management");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid) return null;

  const todayRevenue = (stats?.orders || [])
    .filter((o: any) => o.payment_status === "paid")
    .reduce((s: number, o: any) => s + (o.total || 0), 0);

  const occupiedRooms = (stats?.rooms || []).filter(
    (r: any) => r.status === "occupied"
  ).length;

  return (
    <DashboardShell role="admin" roleLabel="Administrator">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Complete system overview and control
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatKES(todayRevenue)}
          trend="Today"
        />
        <StatCard
          icon={ClipboardList}
          label="Total Orders"
          value={String(stats?.orders.length || 0)}
        />
        <StatCard
          icon={Users}
          label="Active Staff"
          value={String(stats?.staff.length || 0)}
        />
        <StatCard
          icon={Bed}
          label="Room Occupancy"
          value={`${occupiedRooms}/${stats?.rooms.length || 0}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              Staff Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.staff || []).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-foreground">
                      {s.full_name}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {s.position}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.rating}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          s.is_active
                            ? "bg-mpesa-green text-cream"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentOrders || []).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {o.order_number}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {o.customer?.name || "Walk-in"}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatKES(o.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {o.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Customer Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="font-heading text-3xl font-bold text-foreground">
                {stats?.customers.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Customers
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="font-heading text-3xl font-bold text-foreground">
                {stats?.orders.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                All-Time Orders
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="font-heading text-3xl font-bold text-primary">
                {formatKES(todayRevenue)}
              </p>
              <p className="text-sm text-muted-foreground">
                Revenue Collected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
