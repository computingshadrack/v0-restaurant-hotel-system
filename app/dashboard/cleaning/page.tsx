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
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertTriangle, Bed, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

async function fetchCleaningData() {
  const [rooms, tasks, maintenance] = await Promise.all([
    supabase.from("rooms").select("*").eq("status", "cleaning"),
    supabase
      .from("cleaning_tasks")
      .select("*, room:rooms(room_number, class_type)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("maintenance_requests")
      .select("*, room:rooms(room_number)")
      .in("status", ["reported", "in_progress"])
      .order("created_at", { ascending: false }),
  ]);
  return {
    cleaningRooms: rooms.data || [],
    tasks: tasks.data || [],
    maintenance: maintenance.data || [],
  };
}

export default function CleaningDashboard() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data } = useSWR("cleaning-data", fetchCleaningData, {
    refreshInterval: 15000,
  });
  const [maintenanceNote, setMaintenanceNote] = useState("");
  const [reportingRoom, setReportingRoom] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/staff");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "cleaning") {
      router.push("/portal/staff");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid || !data) return null;

  async function markClean(roomId: string) {
    await supabase
      .from("rooms")
      .update({ status: "available" })
      .eq("id", roomId);
    toast.success("Room marked as clean and available!");
    mutate("cleaning-data");
  }

  async function reportMaintenance(roomId: string) {
    if (!maintenanceNote.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    await supabase.from("maintenance_requests").insert({
      room_id: roomId,
      issue: maintenanceNote,
      priority: "medium",
      status: "reported",
    });
    toast.success("Maintenance issue reported");
    setMaintenanceNote("");
    setReportingRoom(null);
    mutate("cleaning-data");
  }

  return (
    <DashboardShell role="cleaning" roleLabel="Cleaning Staff">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Cleaning Dashboard
        </h1>
        <p className="text-muted-foreground">
          Room cleaning tasks and maintenance reporting
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Sparkles}
          label="Rooms to Clean"
          value={String(data.cleaningRooms.length)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Open Maintenance"
          value={String(data.maintenance.length)}
        />
        <StatCard
          icon={CheckCircle}
          label="Tasks Completed"
          value={String(
            data.tasks.filter((t: any) => t.status === "completed").length
          )}
        />
      </div>

      {/* Rooms to Clean */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-foreground">
            <Bed className="h-5 w-5 text-primary" />
            Rooms Awaiting Cleaning
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.cleaningRooms.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              All rooms are clean!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.cleaningRooms.map((room: any) => (
                <div
                  key={room.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-lg font-bold text-foreground">
                      Room {room.room_number}
                    </span>
                    <Badge className="capitalize bg-primary text-primary-foreground">
                      {room.class_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Floor {room.floor}
                  </p>

                  {reportingRoom === room.id ? (
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Describe the maintenance issue..."
                        value={maintenanceNote}
                        onChange={(e) => setMaintenanceNote(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setReportingRoom(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-earth-red text-cream hover:bg-earth-red/90"
                          onClick={() => reportMaintenance(room.id)}
                        >
                          Report
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-mpesa-green text-cream hover:bg-mpesa-green/90"
                        onClick={() => markClean(room.id)}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Mark Clean
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setReportingRoom(room.id)}
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Report Issue
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-foreground">
            <AlertTriangle className="h-5 w-5 text-earth-red" />
            Open Maintenance Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {data.maintenance.map((m: any) => (
              <div
                key={m.id}
                className="flex items-start justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    Room {m.room?.room_number || "N/A"} - {m.issue}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Priority: {m.priority} | Status: {m.status}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    m.priority === "high"
                      ? "bg-earth-red text-cream"
                      : ""
                  }
                >
                  {m.priority}
                </Badge>
              </div>
            ))}
            {data.maintenance.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No open maintenance issues
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
