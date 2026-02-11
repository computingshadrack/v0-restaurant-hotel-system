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
import { CalendarCheck, Bed, CreditCard, Armchair } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

async function fetchReceptionData() {
  const [reservations, rooms, tables, orders] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, customer:customers(name, phone)")
      .order("created_at", { ascending: false }),
    supabase.from("rooms").select("*"),
    supabase.from("dining_tables").select("*"),
    supabase
      .from("orders")
      .select("*, customer:customers(name)")
      .in("payment_status", ["unpaid", "partial"])
      .order("created_at", { ascending: false })
      .limit(15),
  ]);
  return {
    reservations: reservations.data || [],
    rooms: rooms.data || [],
    tables: tables.data || [],
    unpaidOrders: orders.data || [],
  };
}

export default function ReceptionistDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data } = useSWR("reception-data", fetchReceptionData);

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/management");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "receptionist") {
      router.push("/portal/management");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid || !data) return null;

  const pendingReservations = data.reservations.filter(
    (r: any) => r.status === "pending"
  );

  async function confirmReservation(id: string) {
    await supabase
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", id);
    toast.success("Reservation confirmed!");
    mutate("reception-data");
  }

  async function checkIn(id: string, roomId: string | null) {
    await supabase
      .from("reservations")
      .update({ status: "checked_in" })
      .eq("id", id);
    if (roomId) {
      await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", roomId);
    }
    toast.success("Guest checked in!");
    mutate("reception-data");
  }

  async function checkOut(id: string, roomId: string | null) {
    await supabase
      .from("reservations")
      .update({ status: "checked_out" })
      .eq("id", id);
    if (roomId) {
      await supabase
        .from("rooms")
        .update({ status: "cleaning" })
        .eq("id", roomId);
    }
    toast.success("Guest checked out. Room sent to cleaning.");
    mutate("reception-data");
  }

  return (
    <DashboardShell role="receptionist" roleLabel="Receptionist">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Reception Desk
        </h1>
        <p className="text-muted-foreground">
          Bookings, check-in/out, and payment tracking
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Pending Bookings"
          value={String(pendingReservations.length)}
        />
        <StatCard
          icon={Bed}
          label="Available Rooms"
          value={String(
            data.rooms.filter((r: any) => r.status === "available").length
          )}
        />
        <StatCard
          icon={Armchair}
          label="Available Tables"
          value={String(
            data.tables.filter((t: any) => t.status === "available").length
          )}
        />
        <StatCard
          icon={CreditCard}
          label="Unpaid Orders"
          value={String(data.unpaidOrders.length)}
        />
      </div>

      {/* Reservations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Reservations
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.reservations.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">
                    {r.customer?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.customer?.phone || "N/A"}
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
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmReservation(r.id)}
                          className="h-7 text-xs"
                        >
                          Confirm
                        </Button>
                      )}
                      {r.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="h-7 bg-mpesa-green text-xs text-cream hover:bg-mpesa-green/90"
                          onClick={() => checkIn(r.id, r.room_id)}
                        >
                          Check In
                        </Button>
                      )}
                      {r.status === "checked_in" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-transparent"
                          onClick={() => checkOut(r.id, r.room_id)}
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unpaid Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Unpaid Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.unpaidOrders.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.order_number}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {o.customer?.name || "Walk-in"}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {o.order_type}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatKES(o.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        o.payment_status === "unpaid"
                          ? "bg-earth-red text-cream"
                          : "bg-primary text-primary-foreground"
                      }
                    >
                      {o.payment_status}
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
