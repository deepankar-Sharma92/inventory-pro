import { AlertTriangle } from "lucide-react";

export default function LowStockAlerts({ items }) {
  return (
    <div className="panel">
      <h3>
        <AlertTriangle size={16} color="#ef5c5c" />
        Low Stock Alerts
      </h3>
      {items.length === 0 && (
        <p style={{ color: "#8b8ba7", fontSize: 13 }}>All products are well stocked.</p>
      )}
      {items.map((item) => (
        <div className="low-stock-item" key={item.id}>
          <div>
            <p className="name">{item.name}</p>
            <p className="sku">SKU: {item.sku}</p>
          </div>
          <span className="pill">{item.stock} left</span>
        </div>
      ))}
    </div>
  );
}
