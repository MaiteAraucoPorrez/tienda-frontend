"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Producto, Venta } from "@/lib/api";
import { ToastProvider } from "@/components/ToastProvider";

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.productos.list(), api.ventas.list()])
      .then(([p, v]) => {
        setProductos(p);
        setVentas(v);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalVentas = ventas.reduce((s, v) => s + v.total, 0);
  const sinStock = productos.filter((p) => p.stock === 0).length;
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const recientes = [...ventas]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  return (
    <ToastProvider>
      <div className="page page-enter">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Panel de <span>Control</span>
            </h1>
            <p className="page-subtitle">Resumen general del sistema</p>
          </div>
          <div className="action-row">
            <Link href="/productos" className="btn btn-secondary">
              Ver Productos
            </Link>
            <Link href="/ventas" className="btn btn-primary">
              + Nueva Venta
            </Link>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Productos</div>
            <div className={`stat-value ${loading ? "text-mono" : ""}`}>
              {loading ? "—" : productos.length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ventas totales</div>
            <div className={`stat-value accent ${loading ? "text-mono" : ""}`}>
              {loading ? "—" : ventas.length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ingresos (Bs.)</div>
            <div className={`stat-value accent ${loading ? "text-mono" : ""}`}>
              {loading ? "—" : totalVentas.toFixed(2)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sin stock</div>
            <div
              className={`stat-value ${sinStock > 0 ? "danger" : "success"} ${loading ? "text-mono" : ""}`}
            >
              {loading ? "—" : sinStock}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stock bajo (≤5)</div>
            <div
              className={`stat-value ${stockBajo > 0 ? "" : "success"} ${loading ? "text-mono" : ""}`}
            >
              {loading ? "—" : stockBajo}
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Últimas ventas */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Últimas Ventas</span>
              <Link href="/ventas" className="btn btn-secondary btn-sm">
                Ver todo →
              </Link>
            </div>
            <div>
              {loading ? (
                <table className="data-table">
                  <tbody>
                    <tr className="loading-row">
                      <td>
                        <span className="spinner" />
                        Cargando...
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : recientes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p>No hay ventas registradas</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto ID</th>
                      <th>Cantidad</th>
                      <th>Total</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map((v) => (
                      <tr key={v.id} className="venta-row">
                        <td className="id-cell">{v.id}</td>
                        <td className="id-cell">
                          <span className="tag">#{v.productoId}</span>
                        </td>
                        <td>{v.cantidad}</td>
                        <td className="price-cell">Bs. {v.total.toFixed(2)}</td>
                        <td className="venta-date">
                          {new Date(v.fecha).toLocaleString("es-BO", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Alerta de stock */}
          <div>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Alertas de Stock</span>
                <span className="panel-count">{sinStock + stockBajo}</span>
              </div>
              <div>
                {loading ? (
                  <div className="empty-state">
                    <span className="spinner" />
                  </div>
                ) : sinStock === 0 && stockBajo === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <p>Stock en buen estado</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos
                        .filter((p) => p.stock <= 5)
                        .sort((a, b) => a.stock - b.stock)
                        .map((p) => (
                          <tr key={p.id}>
                            <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.nombre}
                            </td>
                            <td>
                              <span
                                className={`text-mono ${
                                  p.stock === 0 ? "stock-empty" : "stock-low"
                                }`}
                              >
                                {p.stock === 0 ? "AGOTADO" : p.stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
