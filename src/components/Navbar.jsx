import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useEnergy } from "../store/EnergyContext";
import "./Navbar.css";

export default function Navbar({ onToggleNotifications }) {
  const { state } = useEnergy();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    {
      to: "/",
      label: "Dashboard",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      to: "/sources",
      label: "Energy Sources",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
    },
    {
      to: "/grid",
      label: "National Grid",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      to: "/battery",
      label: "Battery",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="6" width="18" height="12" rx="2" />
          <path d="M22 10v4" />
          <path d="M6 10v4M10 10v4M14 10v4" />
        </svg>
      ),
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      ),
    },
    {
      to: "/maintenance",
      label: "Maintenance",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14.7 6.3 17.7 3.3 20.7 6.3 17.7 9.3z" />
          <path d="M4 20l8.7-8.7" />
          <path d="M13.5 10.5 17 14" />
        </svg>
      ),
    },
  ];

  const activeAlertCount = state.maintenanceAlerts.filter(
    (a) => !a.resolved,
  ).length;
  const unreadCount =
    state.notifications.filter((n) => !n.read).length + activeAlertCount;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <Link to="/" className="nav-brand">
        <div className="nav-logo">
          <svg viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#8fce8f" strokeWidth="2.5" />
            <circle
              cx="20"
              cy="20"
              r="6"
              stroke="#8fce8f"
              strokeWidth="1.5"
              fill="none"
            />
            <line
              x1="20"
              y1="2"
              x2="20"
              y2="14"
              stroke="#8fce8f"
              strokeWidth="1.5"
            />
            <line
              x1="20"
              y1="26"
              x2="20"
              y2="38"
              stroke="#8fce8f"
              strokeWidth="1.5"
            />
            <line
              x1="2"
              y1="20"
              x2="14"
              y2="20"
              stroke="#8fce8f"
              strokeWidth="1.5"
            />
            <line
              x1="26"
              y1="20"
              x2="38"
              y2="20"
              stroke="#8fce8f"
              strokeWidth="1.5"
            />
            <line
              x1="7.4"
              y1="7.4"
              x2="15.1"
              y2="15.1"
              stroke="#8fce8f"
              strokeWidth="1.2"
            />
            <line
              x1="24.9"
              y1="24.9"
              x2="32.6"
              y2="32.6"
              stroke="#8fce8f"
              strokeWidth="1.2"
            />
            <line
              x1="32.6"
              y1="7.4"
              x2="24.9"
              y2="15.1"
              stroke="#8fce8f"
              strokeWidth="1.2"
            />
            <line
              x1="15.1"
              y1="24.9"
              x2="7.4"
              y2="32.6"
              stroke="#8fce8f"
              strokeWidth="1.2"
            />
          </svg>
        </div>
        <div>
          <span className="nav-title">
            Eco<span className="accent">Grid</span>
          </span>
          <span className="nav-subtitle">
            Ministry of New & Renewable Energy
          </span>
        </div>
      </Link>

      <ul className={`nav-links ${mobileOpen ? "open" : ""}`}>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => {
                setMobileOpen(false);
              }}
            >
              {link.icon} {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button
          className="btn-icon"
          onClick={onToggleNotifications}
          title="Notifications"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount}</span>
          )}
        </button>
        <button
          className="hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
