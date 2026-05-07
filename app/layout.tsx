import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Tienda — Panel de Control",
  description: "Sistema de gestión de productos y ventas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <NavbarWrapper />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
