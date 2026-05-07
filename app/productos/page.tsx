"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Producto } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ToastProvider";
import ProductoForm from "@/components/ProductoForm";
import ConfirmDialog from "@/components/ConfirmDialog";

function ProductosContent() {
  const { toast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Producto | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.productos.list();
      setProductos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar productos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = async () => {
    if (!search.trim()) {
      load();
      return;
    }
    setSearching(true);
    setError("");
    try {
      const data = await api.productos.search(search);
      setProductos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al buscar";
      setError(msg);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape" && search) {
      setSearch("");
      load();
    }
  };

  const handleEdit = (p: Producto) => {
    setEditTarget(p);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditTarget(null);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.productos.delete(deleteTarget.id);
      toast(`"${deleteTarget.nombre}" eliminado.`);
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar";
      toast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const stockClass = (stock: number) => {
    if (stock === 0) return "stock-empty";
    if (stock <= 5) return "stock-low";
    return "stock-ok";
  };

  return (
    <div className="page page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Gestión de <span>Productos</span>
          </h1>
          <p className="page-subtitle">{productos.length} productos en catálogo</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          + Nuevo Producto
        </button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Catálogo</span>
          <div className="search-bar" style={{ margin: 0 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por nombre..."
              style={{ width: 220 }}
            />
            <button
              className="btn btn-secondary"
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? <span className="spinner" /> : "Buscar"}
            </button>
            {search && (
              <button
                className="btn btn-secondary"
                onClick={() => { setSearch(""); load(); }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {error && <div style={{ padding: "1rem" }}><div className="alert alert-error">{error}</div></div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan={6}>
                  <span className="spinner" />
                  Cargando productos...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p>No se encontraron productos</p>
                  </div>
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id}>
                  <td className="id-cell">{p.id}</td>
                  <td>
                    <strong style={{ fontSize: "0.95rem" }}>{p.nombre}</strong>
                  </td>
                  <td style={{ color: "var(--text-muted)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.descripcion || <span style={{ color: "var(--text-dim)" }}>—</span>}
                  </td>
                  <td className="price-cell">Bs. {p.precio.toFixed(2)}</td>
                  <td className={`stock-cell ${stockClass(p.stock)}`}>
                    {p.stock === 0 ? "AGOTADO" : p.stock}
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductoForm
          producto={editTarget}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar Producto"
          message={`¿Estás seguro de eliminar "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default function ProductosPage() {
  return (
    <ToastProvider>
      <ProductosContent />
    </ToastProvider>
  );
}
