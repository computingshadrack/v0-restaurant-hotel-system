"use client";

import type { Staff } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { toast } from "sonner";

export function WaitstaffSection({ staff }: { staff: Staff[] }) {
  function requestStaff(member: Staff) {
    toast.success(
      `Requested ${member.full_name} as your server. They will be with you shortly!`
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Select Your Preferred Waitstaff
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose the server you would like for your dining experience
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member, idx) => (
          <Card
            key={member.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {member.full_name}
                </h3>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(member.rating)
                          ? "fill-primary text-primary"
                          : "text-muted"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-foreground">
                    {member.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.total_orders} orders completed
                </p>
              </div>

              {idx === 0 && (
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  Top Rated
                </span>
              )}

              <Button
                onClick={() => requestStaff(member)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                Request This Staff
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No waitstaff available at the moment.
        </div>
      )}
    </div>
  );
}
