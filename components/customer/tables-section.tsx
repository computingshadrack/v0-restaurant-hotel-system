"use client";

import { useState } from "react";
import type { DiningTable } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Users, MapPin } from "lucide-react";

const TABLE_INFO: Record<string, { label: string; desc: string }> = {
  intimate: {
    label: "Intimate Corner",
    desc: "2 seats - Perfect for couples, window view",
  },
  family: {
    label: "Family Circle",
    desc: "4-6 seats - Central location, spacious",
  },
  chiefs: {
    label: "Chief's Table",
    desc: "8 seats - Private area, dedicated waitstaff",
  },
};

export function TablesSection({
  tables,
  customerId,
}: {
  tables: DiningTable[];
  customerId: string;
}) {
  const [bookingTable, setBookingTable] = useState<DiningTable | null>(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [guests, setGuests] = useState("2");
  const [loading, setLoading] = useState(false);

  const grouped = tables.reduce(
    (acc, t) => {
      if (!acc[t.class_type]) acc[t.class_type] = [];
      acc[t.class_type].push(t);
      return acc;
    },
    {} as Record<string, DiningTable[]>
  );

  async function handleReservation() {
    if (!bookingTable || !date || !timeSlot) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("reservations").insert({
      reservation_type: "table",
      customer_id: customerId,
      table_id: bookingTable.id,
      check_in: date,
      time_slot: timeSlot,
      guests: parseInt(guests),
      status: "pending",
      prepay_amount: 500,
    });

    if (error) {
      toast.error("Reservation failed. Please try again.");
    } else {
      toast.success(
        `Table ${bookingTable.table_number} reserved! KES 500 applies to your bill.`
      );
      setBookingTable(null);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Table Reservation
        </h2>
        <p className="text-sm text-muted-foreground">
          Reserve your perfect dining spot - KES 500 reservation fee applies to
          bill
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {(["intimate", "family", "chiefs"] as const).map((classType) => {
          const info = TABLE_INFO[classType];
          const classTables = grouped[classType] || [];

          return (
            <div key={classType}>
              <div className="mb-4">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {info.label}
                </h3>
                <p className="text-sm text-muted-foreground">{info.desc}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {classTables.map((table) => (
                  <Card key={table.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-heading font-semibold text-foreground">
                          Table {table.table_number}
                        </span>
                        <Badge
                          variant={
                            table.status === "available"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            table.status === "available"
                              ? "bg-mpesa-green text-cream"
                              : ""
                          }
                        >
                          {table.status}
                        </Badge>
                      </div>
                      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {table.capacity} seats
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {table.location}
                        </span>
                      </div>
                      {table.features && (
                        <p className="mb-3 text-xs text-muted-foreground">
                          {table.features}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={table.status !== "available"}
                        onClick={() => setBookingTable(table)}
                      >
                        {table.status === "available"
                          ? "Reserve"
                          : table.status === "reserved"
                            ? "Reserved"
                            : "Occupied"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!bookingTable} onOpenChange={() => setBookingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Reserve Table {bookingTable?.table_number}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {TABLE_INFO[bookingTable?.class_type || "intimate"]?.label} -{" "}
              {bookingTable?.capacity} seats
            </p>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Time</Label>
              <Input
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Guests</Label>
              <Input
                type="number"
                min="1"
                max={bookingTable?.capacity || 8}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Reservation fee: KES 500 (applies to your final bill)
            </p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleReservation}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Reservation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
