"use client";

import React from "react"

import { useState } from "react";
import type { Room } from "@/lib/types";
import { formatKES } from "@/lib/types";
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
import { Wifi, Car, Coffee, Wind, Tv, Bed, Sparkles } from "lucide-react";

const ROOM_INFO: Record<string, { title: string; subtitle: string; gradient: string }> = {
  safari: {
    title: "Safari Class",
    subtitle: "Economy - Comfortable Essentials",
    gradient: "from-amber-800/20 to-amber-600/10",
  },
  savannah: {
    title: "Savannah Class",
    subtitle: "Business - Premium Comfort",
    gradient: "from-emerald-800/20 to-emerald-600/10",
  },
  serenity: {
    title: "Serenity Suite",
    subtitle: "Luxury - Ultimate Experience",
    gradient: "from-violet-800/20 to-violet-600/10",
  },
};

const FEATURE_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Parking: Car,
  Breakfast: Coffee,
  "A/C": Wind,
  DSTV: Tv,
  TV: Tv,
  "King Bed": Bed,
  Jacuzzi: Sparkles,
};

export function RoomsSection({
  rooms,
  customerId,
}: {
  rooms: Room[];
  customerId: string;
}) {
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);

  // Group by class
  const grouped = rooms.reduce(
    (acc, room) => {
      if (!acc[room.class_type]) acc[room.class_type] = [];
      acc[room.class_type].push(room);
      return acc;
    },
    {} as Record<string, Room[]>
  );

  async function handleBooking() {
    if (!bookingRoom || !checkIn || !checkOut) {
      toast.error("Please select dates");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("reservations").insert({
      reservation_type: "room",
      customer_id: customerId,
      room_id: bookingRoom.id,
      check_in: checkIn,
      check_out: checkOut,
      guests: 1,
      status: "pending",
      prepay_amount: bookingRoom.price,
    });

    if (error) {
      toast.error("Booking failed. Please try again.");
    } else {
      toast.success(
        `Room ${bookingRoom.room_number} booked! Confirmation pending.`
      );
      setBookingRoom(null);
      setCheckIn("");
      setCheckOut("");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Room Booking
        </h2>
        <p className="text-sm text-muted-foreground">
          Three distinct classes for every guest
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {(["safari", "savannah", "serenity"] as const).map((classType) => {
          const info = ROOM_INFO[classType];
          const classRooms = grouped[classType] || [];
          const available = classRooms.filter((r) => r.status === "available");

          return (
            <div key={classType}>
              <div className={`mb-4 rounded-lg bg-gradient-to-r ${info.gradient} p-4`}>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {info.title}
                </h3>
                <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                <p className="mt-1 font-heading text-lg font-bold text-primary">
                  {formatKES(classRooms[0]?.price || 0)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    /night
                  </span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-heading font-semibold text-foreground">
                          Room {room.room_number}
                        </span>
                        <Badge
                          variant={
                            room.status === "available"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            room.status === "available"
                              ? "bg-mpesa-green text-cream"
                              : ""
                          }
                        >
                          {room.status}
                        </Badge>
                      </div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        Floor {room.floor}
                      </p>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {(room.features as string[]).slice(0, 4).map((f) => {
                          const IconComp = FEATURE_ICONS[f];
                          return (
                            <span
                              key={f}
                              className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {IconComp && <IconComp className="h-3 w-3" />}
                              {f}
                            </span>
                          );
                        })}
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={room.status !== "available"}
                        onClick={() => setBookingRoom(room)}
                      >
                        {room.status === "available"
                          ? "Book Now"
                          : "Unavailable"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {available.length} of {classRooms.length} rooms available
              </p>
            </div>
          );
        })}
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!bookingRoom} onOpenChange={() => setBookingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Book Room {bookingRoom?.room_number}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {ROOM_INFO[bookingRoom?.class_type || "safari"]?.title} —{" "}
              {formatKES(bookingRoom?.price || 0)}/night
            </p>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Check-in Date</Label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Check-out Date</Label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
