"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "../assets/css/style.css";

export default function Sidebar({ admin }: { admin: any }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    Cookies.remove("admin");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="sidebar">
      {admin ? (
        <>
          <Link
            href="/admin/dashboard"
            className={pathname.startsWith("/admin/dashboard") ? "active" : ""}
          >
            Dashboard
          </Link>

          <Link
            href="/admin/add-bus"
            className={pathname.startsWith("/admin/add-bus") ? "active" : ""}
          >
            Add Bus
          </Link>

          <Link
            href="/admin/buses"
            className={pathname.startsWith("/admin/buses") ? "active" : ""}
          >
            Manage Buses
          </Link>

          <Link
            href="/admin/bookings"
            className={pathname.startsWith("/admin/bookings") ? "active" : ""}
          >
            Bookings
          </Link>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>
          <Link href="/buses" className={pathname === "/buses" ? "active" : ""}>Find Buses</Link>
          <Link href="/track-ticket/login" className={pathname  === "/track-ticket/login" ? "active" : ""}>Track Ticket</Link>
          <Link href="/admin/login" className={pathname === "/admin/login" ? "active" : ""}>Admin Login</Link>
        </>
      )}
    </aside>
  );
}