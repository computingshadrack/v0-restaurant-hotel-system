import React from "react"
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  UtensilsCrossed,
  Users,
  Star,
  Bed,
  Clock,
} from "lucide-react";

function PortalCard({
  href,
  icon: Icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${accent}`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-heading text-xl font-bold text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="mt-2 inline-block rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-secondary">
        Enter Portal
      </span>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-card/80 p-6 backdrop-blur-sm">
      <Icon className="h-6 w-6 text-primary" />
      <span className="font-heading text-2xl font-bold text-foreground">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Savannah Palace Hotel restaurant interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-nairobi-blue/80 via-nairobi-blue/60 to-nairobi-blue/90" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-savannah-gold" />
            <span className="font-heading text-sm font-medium tracking-widest text-savannah-gold uppercase">
              Moi Avenue, Nairobi
            </span>
            <span className="h-px w-12 bg-savannah-gold" />
          </div>

          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-cream md:text-6xl lg:text-7xl">
            <span className="text-balance">Savannah Palace</span>
            <br />
            <span className="text-savannah-gold">Hotel & Restaurant</span>
          </h1>

          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-cream/80">
            Your home away from home in Kenya. Experience premium hospitality
            with authentic Kenyan cuisine, luxurious rooms, and exceptional
            service that celebrates our rich cultural heritage.
          </p>

          <p className="font-heading text-sm font-medium italic text-savannah-gold">
            Karibu Sana — You Are Most Welcome
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Bed} value="9" label="Luxury Rooms" />
            <StatCard icon={UtensilsCrossed} value="22+" label="Menu Items" />
            <StatCard icon={Star} value="4.8" label="Avg Rating" />
            <StatCard icon={Clock} value="24/7" label="Service" />
          </div>
        </div>
      </section>

      {/* Portal Selection */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Select Your Portal
          </h2>
          <p className="mt-2 text-muted-foreground">
            Choose how you would like to access the system
          </p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-primary" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <PortalCard
            href="/portal/management"
            icon={Building2}
            title="Management Portal"
            description="Admin, Manager, and Receptionist access. Oversee operations, manage staff, and control system settings."
            accent="bg-secondary text-secondary-foreground"
          />
          <PortalCard
            href="/portal/staff"
            icon={Users}
            title="Staff Portal"
            description="Waitstaff, Kitchen, Cleaning, and Delivery teams. Access role-specific dashboards and tasks."
            accent="bg-primary text-primary-foreground"
          />
          <PortalCard
            href="/portal/customer"
            icon={UtensilsCrossed}
            title="Customer Portal"
            description="Browse our menu, book rooms, reserve tables, and enjoy our hospitality services."
            accent="bg-earth-red text-cream"
          />
        </div>
      </section>

      {/* Features Preview */}
      <section className="border-t border-border bg-muted/50 px-4 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Authentic Kenyan Cuisine
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From the beloved Nyama Choma to the coastal Chicken Biryani, our
              kitchen serves the finest local and intercontinental dishes
              prepared with love and tradition.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Nyama Choma", "Biryani", "Tilapia", "Ugali", "Mandazi"].map(
                (dish) => (
                  <span
                    key={dish}
                    className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                  >
                    {dish}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src="/images/nyama-choma.jpg"
              alt="Nyama Choma served with kachumbari"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Room Preview */}
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src="/images/serenity-suite.jpg"
              alt="Serenity Suite with city view"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Premium Accommodation
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Three distinct room classes to suit every guest. From our cozy
              Safari rooms to the magnificent Serenity Suites with panoramic
              city views and jacuzzi.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                { name: "Safari Class", price: "KES 4,500" },
                { name: "Savannah Class", price: "KES 7,500" },
                { name: "Serenity Suite", price: "KES 12,500" },
              ].map((room) => (
                <div
                  key={room.name}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
                >
                  <span className="font-medium text-foreground">
                    {room.name}
                  </span>
                  <span className="font-heading font-bold text-primary">
                    {room.price}
                    <span className="text-xs font-normal text-muted-foreground">
                      /night
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary px-4 py-12 text-secondary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <h3 className="font-heading text-xl font-bold">
            Savannah Palace Hotel
          </h3>
          <p className="text-sm text-secondary-foreground/70">
            Moi Avenue, Nairobi | Tel: +254 700 123 456 | VAT Reg:
            P0512345678S
          </p>
          <p className="text-xs text-secondary-foreground/50">
            Asante Sana — Karibu Tena!
          </p>
        </div>
      </footer>
    </main>
  );
}
