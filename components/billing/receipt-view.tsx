"use client";

import { formatKES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function ReceiptView({ order }: { order: any }) {
  function handlePrint() {
    window.print();
  }

  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      <div
        id="receipt-content"
        className="rounded-lg border border-border bg-card p-6 font-mono text-sm"
      >
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground">
            SAVANNAH PALACE HOTEL
          </h2>
          <p className="text-xs text-muted-foreground">
            Moi Avenue, Nairobi, Kenya
          </p>
          <p className="text-xs text-muted-foreground">
            Tel: +254 700 123 456
          </p>
          <p className="text-xs text-muted-foreground">
            VAT Reg: P0512345678S
          </p>
          <div className="mx-auto my-3 border-b border-dashed border-muted-foreground" />
        </div>

        {/* Order Info */}
        <div className="mb-3 flex justify-between text-xs text-muted-foreground">
          <span>Order #: {order.order_number}</span>
          <span>
            {now.toLocaleDateString("en-KE")} {now.toLocaleTimeString("en-KE")}
          </span>
        </div>
        <div className="mb-3 flex justify-between text-xs text-muted-foreground">
          <span>Customer: {order.customer?.name || "Walk-in"}</span>
          <span className="capitalize">{order.order_type?.replace("_", " ")}</span>
        </div>
        <div className="mx-auto mb-3 border-b border-dashed border-muted-foreground" />

        {/* Items */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs font-bold text-foreground">
            <span>Item</span>
            <span>Amount</span>
          </div>
          {order.order_items?.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between text-xs text-foreground"
            >
              <span>
                {item.quantity}x {item.menu_item?.name || "Item"}
              </span>
              <span>{formatKES(item.total_price)}</span>
            </div>
          ))}
        </div>
        <div className="mx-auto mb-3 border-b border-dashed border-muted-foreground" />

        {/* Totals */}
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatKES(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Service Charge (10%)</span>
            <span>{formatKES(Math.round(order.service_charge))}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT (16%)</span>
            <span>{formatKES(Math.round(order.vat))}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-mpesa-green">
              <span>Discount</span>
              <span>-{formatKES(order.discount)}</span>
            </div>
          )}
          <div className="mx-auto my-1 w-full border-b border-dashed border-muted-foreground" />
          <div className="flex justify-between font-bold text-foreground">
            <span>TOTAL</span>
            <span>{formatKES(Math.round(order.total))}</span>
          </div>
        </div>
        <div className="mx-auto my-3 border-b border-dashed border-muted-foreground" />

        {/* Payment Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Paid via:{" "}
            <span className="font-bold text-foreground uppercase">
              {order.payment_method || "N/A"}
            </span>
          </p>
          {order.transaction_code && (
            <p>Transaction: {order.transaction_code}</p>
          )}
          <p className="mt-3 font-heading text-sm italic text-primary">
            Asante Sana - Karibu Tena!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Thank you for dining with us
          </p>
        </div>
      </div>

      <Button onClick={handlePrint} variant="outline" className="w-full bg-transparent">
        <Printer className="mr-2 h-4 w-4" />
        Print Receipt
      </Button>
    </div>
  );
}
