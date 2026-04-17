"use client";
import "./globals.css";
import React, { useState } from "react";
import { ToastProvider } from "./components/ToastProvider";
import Footer from "./components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>ViteBus - Premium Bus Booking</title>
        <meta name="description" content="Book your luxury bus travel with ease" />
      </head>
      <body>
        <ToastProvider>
          <nav className="navbar">
            <div className="main-container navbar-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="/" className="brand-logo">🚌 ViteBus</a>
              
              <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
                ☰
              </div>

              <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
                <a href="/" className="nav-link">Plan Journey</a>
                <a href="/login" className="nav-link">Sign In</a>
              </div>
            </div>
          </nav>
          <main className="page-wrapper">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}