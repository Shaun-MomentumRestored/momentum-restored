"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

export default function CoachNavBar() {
  const pathname = usePathname();

  const signOut = async () => {
    await fetch("/api/coach/auth", { method: "DELETE" });
    window.location.href = "/coach";
  };

  return (
    <nav className="bg-dark-green text-cream px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <Link href="/coach" className="font-bold text-lg tracking-tight hover:opacity-90">
          Momentum Restored{" "}
          <span className="text-xs font-normal text-pale-green/70 uppercase">Coach</span>
        </Link>
        <div className="hidden sm:flex gap-1">
          <Link
            href="/coach"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname === "/coach"
                ? "bg-white/10 text-cream"
                : "text-pale-green hover:text-cream hover:bg-white/5"
            }`}
          >
            Clients
          </Link>
          <Link
            href="/coach/wins"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname === "/coach/wins"
                ? "bg-white/10 text-cream"
                : "text-pale-green hover:text-cream hover:bg-white/5"
            }`}
          >
            Marketing Wins
          </Link>
        </div>
      </div>
      <button
        onClick={signOut}
        className="text-pale-green/70 hover:text-cream text-sm flex items-center gap-1.5 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </nav>
  );
}
