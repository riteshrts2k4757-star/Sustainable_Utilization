import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import NotificationPanel from "./NotificationPanel";

export default function AppShell() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <Navbar onToggleNotifications={() => setNotifOpen((value) => !value)} />
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
      <main className="main-content app-shell-content">
        <Outlet />
      </main>
      <footer className="govt-footer">
        <div className="govt-footer-line">
          <strong>EcoGrid — Sustainable Energy Management Dashboard</strong>
        </div>
        <div className="govt-footer-line">
          Ministry of New and Renewable Energy, Government of India
        </div>
        <div className="govt-footer-line">
          © {new Date().getFullYear()} All Rights Reserved | Designed &
          Developed for Smart India Hackathon
        </div>
      </footer>
    </>
  );
}
