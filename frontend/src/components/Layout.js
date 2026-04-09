import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Students", path: "/students" },
  { label: "Rooms", path: "/rooms" },
  { label: "Wardens", path: "/wardens" },
  { label: "Allocation", path: "/allocations" },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("hostel-user") || "null");

  const title = navItems.find((item) => item.path === location.pathname)?.label || "Hostel";
  const handleLogout = () => {
    localStorage.removeItem("hostel-auth");
    localStorage.removeItem("hostel-user");
    window.dispatchEvent(new Event("hostel-auth-changed"));
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">H</div>
          <h1>Staynix Hostel</h1>
          <p>Smart hostel operations, room by room.</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Staynix Hostel</span>
            <h2>{title}</h2>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <strong>{user?.fullName || "Reception Admin"}</strong>
              <span>{user?.role || "Hostel Staff"}</span>
            </div>
            <button className="ghost-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
