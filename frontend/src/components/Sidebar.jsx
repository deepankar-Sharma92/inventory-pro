import { LayoutGrid, Package, Users, ShoppingCart, X } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "products", label: "Products", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "orders", label: "Orders", icon: ShoppingCart },
];

export default function Sidebar({ active, onNavigate, mobileOpen, onClose }) {
  return (
    <>
      {/* Backdrop only shows on mobile when the drawer is open */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div>
            <h1>Inventory Pro</h1>
            <p className="sidebar-subtitle">Admin Panel</p>
          </div>
          {/* Close button only visible on mobile drawer */}
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <ul className="nav-list">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <li
              key={key}
              className={`nav-item ${active === key ? "active" : ""}`}
              onClick={() => onNavigate(key)}
              title={label}
            >
              <Icon size={18} />
              <span className="nav-label">{label}</span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
