import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data }) {
  return (
    <div className="panel">
      <h3>
        <BarChart3 size={16} color="#34c98e" />
        Top Products by Revenue
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8b8ba7" }} />
          <YAxis tick={{ fontSize: 12, fill: "#8b8ba7" }} />
          <Tooltip />
          <Legend
            formatter={() => "Revenue (₹)"}
            wrapperStyle={{ fontSize: 12, color: "#8b8ba7" }}
          />
          <Bar dataKey="revenue" fill="#5fd6a6" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
