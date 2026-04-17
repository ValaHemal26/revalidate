import React from "react";

export default function Footer() {
  return (
    <footer style={{ marginTop: "auto", padding: "40px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
      <div className="main-container">
        <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--accent-primary)", marginBottom: "16px" }}>ViteBus</h2>
        <p className="text-muted" style={{ marginBottom: "24px" }}>
          Premium luxury bus booking platform. Redefining your travel experience across the nation.
        </p>
        <p className="text-muted" style={{ fontSize: "14px" }}>
          &copy; {new Date().getFullYear()} ViteBus. All rights reserved.
        </p>
      </div>
    </footer>
  );
}