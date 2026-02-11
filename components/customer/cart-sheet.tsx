"use client";

import type { CartItem } from "@/lib/types";
import { formatKES } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function CartSheet({
  open,
  onOpenChange,
  cart,
  onUpdateQuantity,
  onClearCart,
  total,
  customerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearCart: () => void;
  total: number;
  customerId: string;
}) {
  const [loading, setLoading] = useState(false);
  const serviceCharge = total * 0.1;
  const vat = (total + serviceCharge) * 0.16;
  const grandTotal = total + serviceCharge + vat;

  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    setLoading(true);
    const supabase = createClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_type: "dine_in",
        customer_id: customerId,
        status: "pending",
        subtotal: total,
        service_charge: serviceCharge,
        vat: vat,
        total: grandTotal,
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Failed to place order. Please try again.");
      setLoading(false);
      return;
    }

    // Create order items
    const items = cart.map((c) => ({
      order_id: order.id,
      menu_item_id: c.menuItem.id,
      quantity: c.quantity,
      unit_price: c.menuItem.price,
      total_price: c.menuItem.price * c.quantity,
      status: "pending",
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      toast.error("Failed to add items. Please try again.");
    } else {
      toast.success(
        `Order placed! Total: ${formatKES(Math.round(grandTotal))}`
      );
      onClearCart();
      onOpenChange(false);
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-heading">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Order
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <ShoppingCart className="mb-3 h-12 w-12" />
            <p>Your cart is empty</p>
            <p className="text-sm">Browse the menu to add items</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {item.menuItem.name}
                      </p>
                      <p className="text-sm text-primary">
                        {formatKES(item.menuItem.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() =>
                          onUpdateQuantity(
                            item.menuItem.id,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() =>
                          onUpdateQuantity(
                            item.menuItem.id,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="min-w-[80px] text-right font-heading font-semibold text-foreground">
                      {formatKES(item.menuItem.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatKES(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service (10%)</span>
                  <span>{formatKES(Math.round(serviceCharge))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (16%)</span>
                  <span>{formatKES(Math.round(vat))}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-heading text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatKES(Math.round(grandTotal))}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={onClearCart}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  className="flex-1 bg-mpesa-green text-cream hover:bg-mpesa-green/90"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Placing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
