"use client";

import { useState, useEffect } from "react";
import { Producto, ProductoPayload, api } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

interface Props {
  producto?: Producto | null;
  onClose: () => void;
  onSaved: () => void;
}

const empty: ProductoPayload = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
};

export default function ProductoForm({ producto, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<ProductoPayload>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (producto) {
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [producto]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (form.precio <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }
    if (form.stock < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    setLoading(true);
    try {
      if (producto) {
        await api.productos.update(producto.id, form);
        toast("Producto actualizado correctamente.");
      } else {
        await api.productos.create(form);
        toast("Producto creado correctamente.");
      }
      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {producto ? "Editar Producto" : "Nuevo Producto"}
          </span>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-grid">
            <div className="field">
              <label>Nombre *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Laptop HP Pavilion"
                autoFocus
              />
            </div>

            <div className="field">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción del producto..."
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Precio (Bs.) *</label>
                <input
                  name="precio"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.precio}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Stock *</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Guardando...
              </>
            ) : producto ? (
              "Guardar Cambios"
            ) : (
              "Crear Producto"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
