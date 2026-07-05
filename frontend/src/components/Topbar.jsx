import { Bell, Menu } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Hamburger only visible on mobile via CSS */}
        <button className="icon-btn mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <h2>Welcome back, Admin!</h2>
          <p>Here's what's happening with your inventory today</p>
        </div>
      </div>
      <div className="topbar-actions">
        <Bell size={20} color="#6d5bd0" />
        <div className="avatar">AD</div>
      </div>
    </div>
  );
}
