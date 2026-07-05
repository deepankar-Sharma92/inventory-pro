import axios from "axios";

// Configurable via .env (VITE_API_URL). Falls back to localhost for local dev
// if the variable isn't set.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

const api = axios.create({
  baseURL: API_URL,
});

// ---------------- Dashboard ----------------
export const getSummary = () => api.get("/api/dashboard/summary").then((r) => r.data);
export const getRevenueByProduct = () =>
  api.get("/api/dashboard/revenue-by-product").then((r) => r.data);
export const getTopCustomers = () =>
  api.get("/api/dashboard/top-customers").then((r) => r.data);
export const getLowStock = () => api.get("/api/dashboard/low-stock").then((r) => r.data);
export const getRecentOrders = (limit = 5) =>
  api.get(`/api/dashboard/recent-orders?limit=${limit}`).then((r) => r.data);

// ---------------- Products ----------------
export const getProducts = () => api.get("/api/products").then((r) => r.data);
export const createProduct = (data) => api.post("/api/products", data).then((r) => r.data);
export const updateProduct = (id, data) =>
  api.put(`/api/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

// ---------------- Customers ----------------
export const getCustomers = () => api.get("/api/customers").then((r) => r.data);
export const createCustomer = (data) => api.post("/api/customers", data).then((r) => r.data);
export const updateCustomer = (id, data) =>
  api.put(`/api/customers/${id}`, data).then((r) => r.data);
export const deleteCustomer = (id) => api.delete(`/api/customers/${id}`);

// ---------------- Orders ----------------
export const getOrders = () => api.get("/api/orders").then((r) => r.data);
export const createOrder = (data) => api.post("/api/orders", data).then((r) => r.data);
export const updateOrder = (id, data) =>
  api.put(`/api/orders/${id}`, data).then((r) => r.data);
export const deleteOrder = (id) => api.delete(`/api/orders/${id}`);

export default api;
