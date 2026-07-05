import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShoppingCart } from "lucide-react";
import Modal from "../components/Modal.jsx";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getCustomers,
  getProducts,
} from "../api.js";

const EMPTY_FORM = { customer_id: "", product_id: "", qty: "" };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o);
        setCustomers(c);
        setProducts(p);
      })
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

  const openEdit = (o) => {
    setEditing(o);
    setForm({ customer_id: o.customer_id, product_id: o.product_id, qty: o.qty });
    setFormError(null);
    setShowModal(true);
  };

  const handleDelete = async (o) => {
    if (!confirm(`Delete order #${o.id}? This will restore product stock.`)) return;
    try {
      await deleteOrder(o.id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete order");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      customer_id: Number(form.customer_id),
      product_id: Number(form.product_id),
      qty: Number(form.qty),
    };

    if (!payload.customer_id || !payload.product_id) {
      setFormError("Please select a customer and a product.");
      return;
    }
    if (!payload.qty || payload.qty <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }

    try {
      if (editing) {
        await updateOrder(editing.id, payload);
      } else {
        await createOrder(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Something went wrong. Please try again.");
    }
  };

  const selectedProduct = products.find((p) => p.id === Number(form.product_id));
  // stock available for this form = current stock, plus qty already reserved by the order being edited
  const availableStock = selectedProduct
    ? selectedProduct.stock + (editing && editing.product_id === selectedProduct.id ? editing.qty : 0)
    : null;

  if (error) return <div className="error-box">{error}</div>;

  return (
    <>
      <div className="page-header-row">
        <h1 className="page-title">Orders</h1>
        <button
          className="btn-primary"
          onClick={openAdd}
          disabled={customers.length === 0 || products.length === 0}
          title={
            customers.length === 0 || products.length === 0
              ? "Add a customer and a product first"
              : ""
          }
        >
          <Plus size={16} /> Add Order
        </button>
      </div>

      <div className="panel">
        <h3>
          <ShoppingCart size={16} color="#6b78e5" />
          All Orders
        </h3>

        {loading ? (
          <div className="loading">Loading orders…</div>
        ) : orders.length === 0 ? (
          <p style={{ color: "#8b8ba7", fontSize: 13 }}>
            No orders yet. Click "Add Order" to create one.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Amount</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.product_name}</td>
                  <td>{o.qty}</td>
                  <td>{o.order_date}</td>
                  <td className="amount">₹{o.amount.toLocaleString("en-IN")}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(o)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(o)}
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
        <Modal title={editing ? "Edit Order" : "Add Order"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form">
            {formError && <div className="form-error">{formError}</div>}

            <label>
              Customer
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                required
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Product
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                required
              />
              {selectedProduct && (
                <span className="field-hint">{availableStock} in stock</span>
              )}
            </label>

            {selectedProduct && form.qty > 0 && (
              <p className="field-hint">
                Order total: ₹{(selectedProduct.price * Number(form.qty)).toLocaleString("en-IN")}
              </p>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editing ? "Save Changes" : "Add Order"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
