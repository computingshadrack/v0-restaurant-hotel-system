"use client";

import { useState } from "react";
import type { MenuItem, MenuCategory } from "@/lib/types";
import { formatKES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Clock } from "lucide-react";

const CATEGORIES: { key: MenuCategory; label: string }[] = [
  { key: "nyama", label: "Nyama" },
  { key: "wok", label: "Wok" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "seafood", label: "Seafood" },
  { key: "sweets", label: "Sweets" },
  { key: "drinks", label: "Drinks" },
];

export function MenuSection({
  items,
  onAddToCart,
}: {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "all">(
    "all"
  );

  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Our Menu
        </h2>
        <p className="text-sm text-muted-foreground">
          Authentic Kenyan and intercontinental cuisine
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="bg-muted/50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Badge
                    variant="secondary"
                    className="mb-2 text-xs uppercase"
                  >
                    {item.category}
                  </Badge>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {item.name}
                  </h3>
                </div>
                <span className="font-heading text-lg font-bold text-primary">
                  {formatKES(item.price)}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {item.rating_avg} ({item.total_reviews})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.preparation_time} min
                </span>
              </div>
              <Button
                onClick={() => onAddToCart(item)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add to Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No items found in this category.
        </div>
      )}
    </div>
  );
}
