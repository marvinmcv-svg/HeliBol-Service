"use client";
import Link from "next/link";
// Requests that never matched a locale (rare — middleware prefixes everything).
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui",
          background: "#06131F",
          color: "white",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>404</h1>
          <Link href="/es" style={{ color: "#F2A23A" }}>
            Helibol →
          </Link>
        </div>
      </body>
    </html>
  );
}
