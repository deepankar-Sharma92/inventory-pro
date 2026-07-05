import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import RevenueChart from "../components/RevenueChart.jsx";
import CustomersPieChart from "../components/CustomersPieChart.jsx";
import LowStockAlerts from "../components/LowStockAlerts.jsx";
import RecentOrders from "../components/RecentOrders.jsx";
import {
  getSummary,
  getRevenueByProduct,
  getTopCustomers,
  getLowStock,
  getRecentOrders as fetchRecentOrders,
} from "../api.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getSummary(),
      getRevenueByProduct(),
      getTopCustomers(),
      getLowStock(),
      fetchRecentOrders(5),
    ])
      .then(([s, revenue, customers, low, recent]) => {
        setSummary(s);
        setRevenueData(revenue);
        setCustomerData(customers);
        setLowStock(low);
        setOrders(recent);
      })
      .catch(() =>
        setError(
          "Could not reach the API. Make sure the FastAPI backend is running on http://127.0.0.1:8001"
        )
      );
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!summary) return <div className="loading">Loading dashboard…</div>;

  return (
    <>
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-grid">
        <StatCard
          label="Total Products"
          value={summary.total_products}
          icon={Package}
          accent="#6d5bd0"
          iconBg="#ece8fb"
        />
        <StatCard
          label="Total Customers"
          value={summary.total_customers}
          icon={Users}
          accent="#34c98e"
          iconBg="#e4f9ef"
        />
        <StatCard
          label="Total Orders"
          value={summary.total_orders}
          icon={ShoppingCart}
          accent="#f7a55c"
          iconBg="#fdf0e2"
        />
        <StatCard
          label="Low Stock"
          value={summary.low_stock}
          icon={AlertTriangle}
          accent="#ef5c5c"
          iconBg="#fde7e7"
        />
      </div>

      <div className="panel-grid">
        <RevenueChart data={revenueData} />
        <CustomersPieChart data={customerData} />
      </div>

      <div className="bottom-grid">
        <LowStockAlerts items={lowStock} />
        <RecentOrders orders={orders} />
      </div>
    </>
  );
}
