"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Producto, Venta } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ToastProvider";

function VentasContent() {
  const { toast } = useToast();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form
  const [productoId, setProductoId] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("1");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedProducto = productos.find((p) => p.id === parseInt(productoId));
  const preview =
    selectedProducto && parseInt(cantidad) > 0
      ? selectedProducto.precio * parseInt(cantidad)
      : null;

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [v, p] = await Promise.all([api.ventas.list(), api.productos.list()]);
      const sorted = [...v].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setVentas(sorted);
      setProductos(p);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleVenta = async () => {
    setFormError("");
    const pid = parseInt(productoId);
    const qty = parseInt(cantidad);

    if (!pid) { setFormError("Selecciona un producto."); return; }
    if (!qty || qty < 1) { setFormError("La cantidad debe ser mínimo 1."); return; }
    if (selectedProducto && qty > selectedProducto.stock) {
      setFormError(`Stock insuficiente. Disponible: ${selectedProducto.stock}`);
      return;
    }

    setSubmitting(true);
    try {
      const venta = await api.ventas.create(pid, qty);
      toast(`Venta registrada — Total: Bs. ${venta.total.toFixed(2)}`);
      setCantidad("1");
      setProductoId("");
      loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar venta";
      setFormError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalIngresos = ventas.reduce((s, v) => s + v.total, 0);

  const getProductoNombre = (id: number) => {
    const p = productos.find((p) => p.id === id);
    return p ? p.nombre : `Producto #${id}`;
  };

  return (
    <div className="page page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Registro de <span>Ventas</span>
          </h1>
          <p className="page-subtitle">
            {ventas.length} venta{ventas.length !== 1 ? "s" : ""} — Bs.{" "}
            {totalIngresos.toFixed(2)} en ingresos
          </p>
        </div>
      </div>

      <div className="main-grid">
        {/* Lista de ventas */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Historial</span>
            <span className="panel-count">{ventas.length}</span>
          </div>

          {error && (
            <div style={{ padding: "1rem" }}>
              <div className="alert alert-error">{error}</div>
            </div>
          )}

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={5}>
                    <span className="spinner" />
                    Cargando ventas...
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🧾</div>
                      <p>No hay ventas registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id} className="venta-row">
                    <td className="id-cell">{v.id}</td>
                    <td
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getProductoNombre(v.productoId)}
                    </td>
                    <td className="text-mono">{v.cantidad}</td>
                    <td className="price-cell">Bs. {v.total.toFixed(2)}</td>
                    <td className="venta-date">
                      {new Date(v.fecha).toLocaleString("es-BO", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario nueva venta */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Nueva Venta</span>
          </div>
          <div className="panel-body">
            {formError && (
              <div className="alert alert-error">{formError}</div>
            )}

            <div className="form-grid">
              <div className="field">
                <label>Producto *</label>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  disabled={loading || submitting}
                >
                  <option value="">— Selecciona un producto —</option>
                  {productos
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.stock === 0}
                      >
                        {p.stock === 0 ? "[AGOTADO] " : ""}
                        {p.nombre} — Bs. {p.precio.toFixed(2)} (stock: {p.stock})
                      </option>
                    ))}
                </select>
              </div>

              <div className="field">
                <label>Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProducto?.stock || 9999}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  disabled={!productoId || submitting}
                />
              </div>

              {selectedProducto && (
                <>
                  <hr className="divider" />
                  <div
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      padding: "1rem",
                    }}
                  >
                    <div className="stat-label" style={{ marginBottom: 4 }}>
                      Precio unitario
                    </div>
                    <div
                      className="text-mono"
                      style={{ color: "var(--text)", marginBottom: 12 }}
                    >
                      Bs. {selectedProducto.precio.toFixed(2)}
                    </div>
                    <div className="stat-label" style={{ marginBottom: 4 }}>
                      Stock disponible
                    </div>
                    <div
                      className={`text-mono ${
                        selectedProducto.stock === 0
                          ? "stock-empty"
                          : selectedProducto.stock <= 5
                          ? "stock-low"
                          : "stock-ok"
                      }`}
                      style={{ marginBottom: 12 }}
                    >
                      {selectedProducto.stock} unidades
                    </div>
                    {preview !== null && (
                      <>
                        <div className="stat-label" style={{ marginBottom: 4 }}>
                          Total a cobrar
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--display)",
                            fontSize: "1.8rem",
                            fontWeight: 900,
                            color: "var(--accent)",
                            lineHeight: 1,
                          }}
                        >
                          Bs. {preview.toFixed(2)}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              <button
                className="btn btn-primary btn-full"
                onClick={handleVenta}
                disabled={submitting || !productoId || !cantidad}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Venta"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VentasPage() {
  return (
    <ToastProvider>
      <VentasContent />
    </ToastProvider>
  );
}
