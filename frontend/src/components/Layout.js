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

  const handleLogout = () => {
    localStorage.removeItem("hostel-auth");
    navigate("/");
  };

  const title = navItems.find((item) => item.path === location.pathname)?.label || "Hostel";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">H</div>
          <h1>HostelMS</h1>
          <p>Stay organized, room by room.</p>
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
            <span className="eyebrow">Hostel Management System</span>
            <h2>{title}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
