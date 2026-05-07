"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        await fetch("http://localhost:8080/api/productos", { signal: AbortSignal.timeout(2000) });
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };
    check();
    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span className="navbar-logo">Tienda</span>
        <span className="navbar-tag">v1.0</span>
      </Link>

      <ul className="navbar-nav">
        <li>
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            Inicio
          </Link>
        </li>
        <li>
          <Link
            href="/productos"
            className={pathname.startsWith("/productos") ? "active" : ""}
          >
            Productos
          </Link>
        </li>
        <li>
          <Link
            href="/ventas"
            className={pathname.startsWith("/ventas") ? "active" : ""}
          >
            Ventas
          </Link>
        </li>
      </ul>

      <div className="navbar-status">
        <span className={`status-dot ${online ? "" : "offline"}`} />
        <span>{online ? "API OK" : "API OFFLINE"}</span>
      </div>
    </nav>
  );
}
