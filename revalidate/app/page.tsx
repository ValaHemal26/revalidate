"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero">
        <h1>Book Your Bus Tickets Easily</h1>
        <p>Search buses, check availability, and book seats online.</p>
        <Link href="/buses">
          <button className="search-bus-btn">Search Buses</button>
        </Link>
      </div>
    </div>
  );
}