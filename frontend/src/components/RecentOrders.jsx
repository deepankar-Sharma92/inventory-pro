import { ShoppingCart } from "lucide-react";

export default function RecentOrders({ orders }) {
  return (
    <div className="panel">
      <h3>
        <ShoppingCart size={16} color="#6b78e5" />
        Recent Orders
      </h3>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.customer_name}</td>
              <td>{o.product_name}</td>
              <td>{o.qty}</td>
              <td className="amount" style={{ textAlign: "right" }}>
                ₹{o.amount.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
