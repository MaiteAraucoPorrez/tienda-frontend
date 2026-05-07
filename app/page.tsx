"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div>
      <nav>
        <Navbar
          title="Tienda"
          links={[
            { label: 'Inicio', href: '/' },
            { label: 'Productos', href: '/productos' },
          ]}
        />
      </nav>
      <h1>Pagina principal</h1>
    </div>
  );
}
