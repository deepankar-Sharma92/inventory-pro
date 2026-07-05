import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import Modal from "../components/Modal.jsx";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api.js";

const EMPTY_FORM = { name: "", sku: "", stock: "", price: "", low_stock_threshold: 5 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited, or null = adding
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setError("Could not reach the API on http://127.0.0.1:8001"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      price: p.price,
      low_stock_threshold: p.low_stock_threshold,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(p.id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete product");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      stock: Number(form.stock),
      price: Number(form.price),
      low_stock_threshold: Number(form.low_stock_threshold) || 5,
    };

    if (!payload.name || !payload.sku) {
      setFormError("Name and SKU are required.");
      return;
    }
    if (payload.stock < 0 || payload.price < 0) {
      setFormError("Stock and price must be zero or greater.");
      return;
    }

    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Something went wrong. Please try again.");
    }
  };

  if (error) return <div className="error-box">{error}</div>;

  return (
    <>
      <div className="page-header-row">
        <h1 className="page-title">Products</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="panel">
        <h3>
          <Package size={16} color="#6d5bd0" />
          All Products
        </h3>

        {loading ? (
          <div className="loading">Loading products…</div>
        ) : products.length === 0 ? (
          <p style={{ color: "#8b8ba7", fontSize: 13 }}>
            No products yet. Click "Add Product" to create one.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Revenue</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>
                    {p.stock <= p.low_stock_threshold ? (
                      <span className="pill">{p.stock} left</span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td>₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="amount">₹{p.revenue.toLocaleString("en-IN")}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(p)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(p)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form">
            {formError && <div className="form-error">{formError}</div>}

            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label>
              SKU
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </label>

            <div className="form-row">
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </label>

              <label>
                Price (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </label>
            </div>

            <label>
              Low stock threshold
              <input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
              />
            </label>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
