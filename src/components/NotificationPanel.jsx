import { useEnergy } from "../store/EnergyContext";
import "./NotificationPanel.css";

const SEVERITY_STYLES = {
  critical: {
    color: "#c62828",
    bg: "rgba(198,40,40,0.08)",
    label: "🔴 CRITICAL",
  },
  warning: { color: "#e65100", bg: "rgba(230,81,0,0.08)", label: "🟠 WARNING" },
  info: { color: "#1565c0", bg: "rgba(21,101,192,0.08)", label: "🔵 INFO" },
  normal: { color: "#2e7d32", bg: "rgba(46,125,50,0.08)", label: "🟢 NORMAL" },
};

export default function NotificationPanel({ isOpen, onClose: _onClose }) {
  const { state, dispatch } = useEnergy();

  const handleMarkRead = (id) => {
    dispatch({ type: "MARK_NOTIF_READ", payload: id });
  };

  // Active maintenance alerts (unresolved)
  const activeAlerts = state.maintenanceAlerts.filter((a) => !a.resolved);
  const criticalCount = activeAlerts.filter(
    (a) => a.severity === "critical",
  ).length;
  const warningCount = activeAlerts.filter(
    (a) => a.severity === "warning",
  ).length;

  return (
    <div className={`notification-panel ${isOpen ? "open" : ""}`}>
      <div className="notif-header">
        <h3>Notification Center</h3>
        <button
          className="btn-text"
          onClick={() => dispatch({ type: "CLEAR_NOTIFICATIONS" })}
        >
          Clear All
        </button>
      </div>

      {/* Maintenance Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="notif-maint-section">
          <div className="notif-maint-header">
            <span className="notif-maint-title">🔧 Maintenance Alerts</span>
            <div className="notif-maint-badges">
              {criticalCount > 0 && (
                <span className="notif-maint-badge notif-maint-badge-critical">
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="notif-maint-badge notif-maint-badge-warning">
                  {warningCount} Warning
                </span>
              )}
              <span className="notif-maint-badge notif-maint-badge-total">
                {activeAlerts.length} Active
              </span>
            </div>
          </div>
          <div className="notif-maint-list">
            {activeAlerts.map((alert) => {
              const sev =
                SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
              return (
                <div
                  className="notif-maint-item"
                  key={alert.id}
                  style={{ borderLeftColor: sev.color }}
                >
                  <div className="notif-maint-item-top">
                    <span className="notif-maint-item-label">
                      {alert.label}
                    </span>
                    <span
                      className="notif-maint-sev-badge"
                      style={{ color: sev.color, background: sev.bg }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="notif-maint-item-desc">
                    {alert.reason || alert.desc}
                  </p>
                  <div className="notif-maint-item-footer">
                    <span className="notif-maint-item-meta">
                      Efficiency: <strong>{alert.efficiency}%</strong> •{" "}
                      {alert.time}
                    </span>
                    <div className="notif-maint-item-actions">
                      <button
                        className="notif-maint-btn notif-maint-btn-resolve"
                        onClick={() =>
                          dispatch({ type: "RESOLVE_ALERT", payload: alert.id })
                        }
                      >
                        ✓ Resolve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Notifications */}
      <div className="notif-list">
        {state.notifications.length === 0 && activeAlerts.length === 0 ? (
          <div className="notif-empty">No new notifications</div>
        ) : state.notifications.length === 0 ? null : (
          <>
            <div className="notif-section-label">System Notifications</div>
            {state.notifications.map((n) => {
              const sev = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
              const isUnread = !n.read;

              return (
                <div
                  className={`notif-item ${isUnread ? "unread" : "read"}`}
                  key={n.id}
                  style={{ borderLeftColor: sev.color }}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className="notif-item-top">
                    <span
                      className="notif-sev"
                      style={{ color: sev.color, background: sev.bg }}
                    >
                      {sev.label}
                    </span>
                    <span className="notif-time">{n.time}</span>
                  </div>

                  <div className="notif-title">
                    {isUnread && <span className="unread-dot" />}
                    {n.title}
                  </div>

                  {n.type === "maintenance" ? (
                    <div className="notif-maint-details">
                      <p>
                        <strong>Reason:</strong>{" "}
                        {n.msg.split(" Dispatch")[0] ||
                          n.msg.split(" Halt")[0] ||
                          n.msg.split(" Inspect")[0] ||
                          n.msg.split(" Check")[0] ||
                          n.msg.split(" Replenish")[0]}
                      </p>
                      <p>
                        <strong>Recommended Action:</strong> {n.msg}
                      </p>
                    </div>
                  ) : (
                    <div className="notif-msg">{n.msg}</div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
