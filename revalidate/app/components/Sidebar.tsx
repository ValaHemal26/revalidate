"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "../assets/css/admin-modern.css";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

interface SidebarProps {
  userRole?: "ADMIN" | "OPERATOR" | "USER";
  userName?: string;
  admin?: any;
}

export default function Sidebar({ userRole = "ADMIN", userName = "Admin", admin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const adminNav: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Add Bus", href: "/admin/add-bus", icon: "➕" },
    { label: "Manage Buses", href: "/admin/buses", icon: "🚌" },
    { label: "Bookings", href: "/admin/bookings", icon: "📋" },
    { label: "Operators", href: "/admin/operators", icon: "👥" },
    { label: "Locations", href: "/admin/pending-locations", icon: "🗺️" },
    { label: "Profile", href: "/admin/profile", icon: "👤" },
  ];

  const operatorNav: NavItem[] = [
    { label: "Dashboard", href: "/operator/dashboard", icon: "📊" },
    { label: "My Buses", href: "/operator/buses", icon: "🚌" },
    { label: "My Routes", href: "/operator/routes", icon: "🛣️" },
    { label: "Bookings", href: "/operator/bookings", icon: "📋" },
    { label: "Analytics", href: "/operator/analytics", icon: "📈" },
  ];

  const navItems = userRole === "ADMIN" ? adminNav : operatorNav;

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  function handleLogout() {
    Cookies.remove("token");
    Cookies.remove("admin");
    Cookies.remove("operator");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      className="admin-sidebar"
      style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        minHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo & Branding */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          {userRole === "ADMIN" ? "🔧" : "🚌"}
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "600", lineHeight: "1.2" }}>
            {userRole === "ADMIN" ? "Admin" : "Operator"}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.7 }}>Panel</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  color: isActive(item.href) ? "white" : "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  background: isActive(item.href)
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  borderLeft: isActive(item.href)
                    ? "3px solid var(--secondary)"
                    : "3px solid transparent",
                  transition: "all 0.3s ease",
                  fontWeight: isActive(item.href) ? "600" : "500",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "var(--secondary)",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div
        style={{
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            {userName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.7 }}>
              {userRole === "ADMIN" ? "Administrator" : "Operator"}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(239, 68, 68, 0.2)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(239, 68, 68, 0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.15)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.2)";
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
       