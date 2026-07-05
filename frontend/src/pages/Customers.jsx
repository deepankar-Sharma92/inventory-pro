import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import Modal from "../components/Modal.jsx";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api.js";

const EMPTY_FORM = { name: "", email: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
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

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email });
    setFormError(null);
    setShowModal(true);
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    try {
      await deleteCustomer(c.id);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete customer");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const payload = { name: form.name.trim(), email: form.email.trim() };
    if (!payload.name || !payload.email) {
      setFormError("Name and email are required.");
      return;
    }

    try {
      if (editing) {
        await updateCustomer(editing.id, payload);
      } else {
        await createCustomer(payload);
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
        <h1 className="page-title">Customers</h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="panel">
        <h3>
          <Users size={16} color="#34c98e" />
          All Customers
        </h3>

        {loading ? (
          <div className="loading">Loading customers…</div>
        ) : customers.length === 0 ? (
          <p style={{ color: "#8b8ba7", fontSize: 13 }}>
            No customers yet. Click "Add Customer" to create one.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Spent</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td className="amount">₹{c.total_spent.toLocaleString("en-IN")}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(c)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(c)}
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
        <Modal title={editing ? "Edit Customer" : "Add Customer"} onClose={() => setShowModal(false)}>
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
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editing ? "Save Changes" : "Add Customer"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
