"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../assets/css/style.css";

export default function Header({ admin }: { admin: any }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? "active" : "";
  };

  return (
    <header className="header">
      <div className="logo">
        Bus Booking System
      </div>

      <nav className="nav-links">
        {admin ? (
          <>
            <Link href="/admin/dashboard" className={isActive("/admin/dashboard")}>
              Dashboard
            </Link>

            <Link href="/admin/add-bus" className={isActive("/admin/add-bus")}>
              Add Bus
            </Link>

            <Link href="/admin/buses" className={isActive("/admin/buses")}>
              Manage Buses
            </Link>

            <Link href="/admin/bookings" className={isActive("/admin/bookings")}>
              Bookings
            </Link>
          </>
        ) : (
          <>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              Home
            </Link>

            <Link href="/buses" className={isActive("/buses")}>
              Find Buses
            </Link>

            <Link href="/track-ticket/login" className={isActive("/track-ticket/login")}>
              Track Ticket
            </Link>

            <Link href="/admin/login" className={isActive("/admin/login")}>
              Admin Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}