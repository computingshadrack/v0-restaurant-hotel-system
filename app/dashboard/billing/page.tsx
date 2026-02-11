"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatKES } from "@/lib/types";
import { CreditCard, Receipt, Smartphone, Banknote } from "lucide-react";
import { toast } from "sonner";
import { ReceiptView } from "@/components/billing/receipt-view";

const supabase = createClient();

async function fetchBillingOrders() {
  const { data } = await supabase
    .from("orders")
    .select(
      "*, customer:customers(name, phone), order_items(*, menu_item:menu_items(name))"
    )
    .in("payment_status", ["unpaid", "partial"])
    .order("created_at", { ascending: false });
  return data || [];
}

export default function BillingPage() {
  const router = useRouter();
  const [valid, setValid] = useState(false);
  const { data: orders } = useSWR("billing-orders", fetchBillingOrders);
  const [payingOrder, setPayingOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [transactionCode, setTransactionCode] = useState("");
  const [discount, setDiscount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(stored);
    if (!["admin", "manager", "receptionist"].includes(parsed.role)) {
      router.push("/");
      return;
    }
    setValid(true);
  }, [router]);

  if (!valid) return null;

  async function processPayment() {
    if (!payingOrder) return;
    setLoading(true);

    const discountAmount = parseFloat(discount) || 0;
    const finalTotal = payingOrder.total - discountAmount;

    await supabase
      .from("orders")
      .update({
        payment_method: paymentMethod,
        payment_status: "paid",
        transaction_code:
          transactionCode || `TXN${Date.now().toString(36).toUpperCase()}`,
        discount: discountAmount,
        total: finalTotal,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", payingOrder.id);

    toast.success(
      `Payment of ${formatKES(Math.round(finalTotal))} received via ${paymentMethod.toUpperCase()}`
    );

    // Reload order with updated data for receipt
    const { data: updatedOrder } = await supabase
      .from("orders")
      .select(
        "*, customer:customers(name, phone), order_items(*, menu_item:menu_items(name))"
      )
      .eq("id", payingOrder.id)
      .single();

    setPayingOrder(null);
    setTransactionCode("");
    setDiscount("0");
    setLoading(false);

    if (updatedOrder) {
      setReceiptOrder(updatedOrder);
    }

    mutate("billing-orders");
  }

  return (
    <DashboardShell role="billing" roleLabel="Billing & Payments">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Billing & Payments
        </h1>
        <p className="text-muted-foreground">
          Process payments and generate receipts
        </p>
      </div>

      {/* Payment Methods */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { icon: Smartphone, label: "M-Pesa", key: "mpesa" },
          { icon: Banknote, label: "Cash", key: "cash" },
          { icon: CreditCard, label: "Card", key: "card" },
          { icon: Smartphone, label: "T-Cash", key: "tcash" },
        ].map((method) => (
          <Card
            key={method.key}
            className="flex items-center gap-3 p-4"
          >
            <method.icon className="h-8 w-8 text-primary" />
            <div>
              <p className="font-heading font-semibold text-foreground">
                {method.label}
              </p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Unpaid Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-foreground">
            Unpaid Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders || []).map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.order_number}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {o.customer?.name || "Walk-in"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {o.order_items
                      ?.map(
                        (i: any) =>
                          `${i.quantity}x ${i.menu_item?.name}`
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatKES(o.subtotal)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatKES(Math.round(o.service_charge))}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatKES(Math.round(o.vat))}
                  </TableCell>
                  <TableCell className="font-heading font-bold text-foreground">
                    {formatKES(Math.round(o.total))}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-mpesa-green text-cream hover:bg-mpesa-green/90"
                      onClick={() => setPayingOrder(o)}
                    >
                      Pay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(orders || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No unpaid orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={!!payingOrder} onOpenChange={() => setPayingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Process Payment - Order #{payingOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Customer: {payingOrder?.customer?.name || "Walk-in"}
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                {formatKES(Math.round(payingOrder?.total || 0))}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="tcash">T-Cash</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "mpesa" && (
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">M-Pesa Transaction Code</Label>
                <Input
                  value={transactionCode}
                  onChange={(e) =>
                    setTransactionCode(e.target.value.toUpperCase())
                  }
                  placeholder="e.g., SG45T7KJ8P"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Discount (KES)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
              />
            </div>

            <Button
              className="w-full bg-mpesa-green text-cream hover:bg-mpesa-green/90"
              onClick={processPayment}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : `Confirm Payment - ${formatKES(Math.round((payingOrder?.total || 0) - (parseFloat(discount) || 0)))}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptOrder} onOpenChange={() => setReceiptOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Receipt</DialogTitle>
          </DialogHeader>
          {receiptOrder && <ReceiptView order={receiptOrder} />}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
