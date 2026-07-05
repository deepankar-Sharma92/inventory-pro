import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Customers from "./pages/Customers.jsx";
import Orders from "./pages/Orders.jsx";

const PAGES = {
  dashboard: Dashboard,
  products: Products,
  customers: Customers,
  orders: Orders,
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const ActivePage = PAGES[active];

  // Close the mobile drawer automatically whenever the page navigates
  const handleNavigate = (key) => {
    setActive(key);
    setMobileNavOpen(false);
  };

  // Close the drawer if the viewport is resized past the mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileNavOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <main className="main">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <ActivePage />
      </main>
    </div>
  );
}
