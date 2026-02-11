"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { MenuItem, Room, DiningTable, Staff, CartItem } from "@/lib/types";
import { formatKES } from "@/lib/types";
import { CustomerHeader } from "@/components/customer/customer-header";
import { MenuSection } from "@/components/customer/menu-section";
import { RoomsSection } from "@/components/customer/rooms-section";
import { TablesSection } from "@/components/customer/tables-section";
import { WaitstaffSection } from "@/components/customer/waitstaff-section";
import { CartSheet } from "@/components/customer/cart-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Bed, Armchair, Users } from "lucide-react";

const supabase = createClient();

async function fetchMenu() {
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category");
  return data as MenuItem[];
}

async function fetchRooms() {
  const { data } = await supabase.from("rooms").select("*").order("price");
  return data as Room[];
}

async function fetchTables() {
  const { data } = await supabase
    .from("dining_tables")
    .select("*")
    .order("table_number");
  return data as DiningTable[];
}

async function fetchWaitstaff() {
  const { data } = await supabase
    .from("staff")
    .select("*")
    .eq("position", "waitstaff")
    .eq("is_active", true)
    .order("rating", { ascending: false });
  return data as Staff[];
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<{
    customerName: string;
    customerId: string;
  } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: menuItems } = useSWR("menu_items", fetchMenu);
  const { data: rooms } = useSWR("rooms", fetchRooms);
  const { data: tables } = useSWR("dining_tables", fetchTables);
  const { data: waitstaff } = useSWR("waitstaff", fetchWaitstaff);

  useEffect(() => {
    const stored = sessionStorage.getItem("portal_session");
    if (!stored) {
      router.push("/portal/customer");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.portalType !== "customer") {
      router.push("/portal/customer");
      return;
    }
    setSession(parsed);
  }, [router]);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function updateCartQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.menuItem.id === itemId ? { ...c, quantity } : c
        )
      );
    }
  }

  function clearCart() {
    setCart([]);
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader
        customerName={session.customerName}
        cartCount={cart.reduce((s, c) => s + c.quantity, 0)}
        onCartClick={() => setCartOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="menu" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bed className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Armchair className="h-4 w-4" />
              <span className="hidden sm:inline">Tables</span>
            </TabsTrigger>
            <TabsTrigger value="waitstaff" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Waitstaff</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuSection
              items={menuItems || []}
              onAddToCart={addToCart}
            />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomsSection rooms={rooms || []} customerId={session.customerId} />
          </TabsContent>

          <TabsContent value="tables">
            <TablesSection tables={tables || []} customerId={session.customerId} />
          </TabsContent>

          <TabsContent value="waitstaff">
            <WaitstaffSection staff={waitstaff || []} />
          </TabsContent>
        </Tabs>
      </main>

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onClearCart={clearCart}
        total={cartTotal}
        customerId={session.customerId}
      />
    </div>
  );
}
