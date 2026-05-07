const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

export interface Venta {
  id: number;
  productoId: number;
  cantidad: number;
  total: number;
  fecha: string;
}

export interface ProductoPayload {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }

  // DELETE returns empty body
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ---- Productos ----
export const api = {
  productos: {
    list: () => request<Producto[]>("/api/productos"),
    get: (id: number) => request<Producto>(`/api/productos/${id}`),
    search: (nombre: string) =>
      request<Producto[]>(`/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`),
    create: (data: ProductoPayload) =>
      request<Producto>("/api/productos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: ProductoPayload) =>
      request<Producto>(`/api/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/productos/${id}`, { method: "DELETE" }),
  },
  ventas: {
    list: () => request<Venta[]>("/api/ventas"),
    create: (productoId: number, cantidad: number) =>
      request<Venta>("/api/ventas", {
        method: "POST",
        body: JSON.stringify({ productoId, cantidad }),
      }),
  },
};
