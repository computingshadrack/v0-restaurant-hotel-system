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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatKES } from "@/lib/types";
import { Users, ClipboardList, Bed, Armchair } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

async function fetchManagerData() {
  const [orders, rooms, tables, staff, reservations] = await Promise.all([
    supabase
      .from("orders")
      .select("*, customer:customers(name)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("rooms").select("*"),
    supabase.from("dining_tables").select("*"),
    supabase.from("staff").select("*").eq("is_active", true),
    supabase
      .from("reservations")
      .select("*, customer:customers(name, phone)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  return {
    orders: orders.data || [],
    rooms: rooms.data || [],
    tables: tables.data || [],
    staff: staff.data || [],
    reservations: reservations.data || [],
  };
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data } = useSWR("manager-data", fetchManagerData);

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/management");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "manager") {
      router.push("/portal/management");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid || !data) return null;

  const pendingOrders = data.orders.filter((o: any) => o.status === "pending");
  const availableRooms = data.rooms.filter(
    (r: any) => r.status === "available"
  );
  const availableTables = data.tables.filter(
    (t: any) => t.status === "available"
  );

  async function updateOrderStatus(orderId: string, status: string) {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }
    await supabase.from("orders").update(updateData).eq("id", orderId);
    toast.success(`Order status updated to ${status}`);
    mutate("manager-data");
  }

  async function updateRoomStatus(roomId: string, status: string) {
    await supabase.from("rooms").update({ status }).eq("id", roomId);
    toast.success(`Room status updated`);
    mutate("manager-data");
  }

  return (
    <DashboardShell role="manager" roleLabel="Manager">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          Operations and staff management
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Pending Orders"
          value={String(pendingOrders.length)}
        />
        <StatCard
          icon={Users}
          label="Active Staff"
          value={String(data.staff.length)}
        />
        <StatCard
          icon={Bed}
          label="Available Rooms"
          value={`${availableRooms.length}/${data.rooms.length}`}
        />
        <StatCard
          icon={Armchair}
          label="Available Tables"
          value={`${availableTables.length}/${data.tables.length}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orders.slice(0, 15).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {o.order_number}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {o.customer?.name || "Walk-in"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatKES(o.total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={o.status}
                        onValueChange={(val) =>
                          updateOrderStatus(o.id, val)
                        }
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "pending",
                            "confirmed",
                            "preparing",
                            "ready",
                            "served",
                            "completed",
                            "cancelled",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              Room Status
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rooms.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">
                      {r.room_number}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {r.class_type}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatKES(r.price)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.status}
                        onValueChange={(val) =>
                          updateRoomStatus(r.id, val)
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "available",
                            "occupied",
                            "cleaning",
                            "maintenance",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Reservations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Recent Reservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.reservations.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-foreground">
                    {r.customer?.name || "N/A"}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {r.reservation_type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(r.check_in).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.guests}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
