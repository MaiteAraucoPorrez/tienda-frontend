import type { Metadata } from "next";
import "./globals.css";
import React from "react";


function Navbar({ title }: { title?: string }) {
  return (
    <header className="navbar">
      <div className="navbar-content">
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar/>
      <div className="container">
        <main className="main">{children}</main>
      </div>
    </>
  );
}