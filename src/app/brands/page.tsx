"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { slugify } from "@/lib/brand-utils";

export default function BrandsIndexPage() {
  const [vendors, setVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/brands/vendors")
      .then((r) => r.json())
      .then((data) => setVendors(data.vendors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? vendors.filter((v) => v.toLowerCase().includes(search.toLowerCase()))
    : vendors;

  return (
    <main className="px-6 py-16 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-serif font-light text-white sm:text-5xl lg:text-6xl">
          Brands
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          {loading ? "Loading..." : `${vendors.length} brands. Every product links straight to the store.`}
        </p>

        {/* Search */}
        <div className="relative mt-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600"
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))
            : filtered.map((vendor) => (
                <Link
                  key={vendor}
                  href={`/brands/${slugify(vendor)}`}
                  className="group flex items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900/50 px-4 py-8 text-center transition hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <span className="text-sm font-light text-zinc-300 transition group-hover:text-white">
                    {vendor}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </main>
  );
}
