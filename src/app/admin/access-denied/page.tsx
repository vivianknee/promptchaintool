"use client";

import Link from "next/link";
import { useTheme } from "@/app/theme-provider";

export default function AccessDeniedPage() {
  const { theme, toggle } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors"
      style={{ background: "var(--background)" }}
    >
      <button
        onClick={toggle}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--btn-bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--btn-bg)")}
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="text-center">
        <h1
          className="text-4xl font-bold mb-3 tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Access Denied
        </h1>
        <p className="mb-6" style={{ color: "var(--muted)" }}>
          You don&apos;t have permission to access this area.
        </p>
        <Link
          href="/"
          className="font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg inline-block"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
