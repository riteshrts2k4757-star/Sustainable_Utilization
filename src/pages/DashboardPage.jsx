import { useState, useEffect } from "react";
import { useEnergy } from "../store/EnergyContext";
import KPICards from "../components/KPICards";
import EnergyMix from "../components/EnergyMix";
import EnergyHubFlow from "../components/EnergyHubFlow";
import MaintenanceAlerts from "../components/MaintenanceAlerts";
import HubDetailsModal from "../components/HubDetailsModal";

export default function DashboardPage() {
  const { state, dispatch } = useEnergy();
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "SIMULATE_TICK" });
      dispatch({ type: "RECORD_HISTORY" });
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (!state.solarSimulation.isPlaying) return;

    const interval = setInterval(() => {
      dispatch({ type: "ADVANCE_SOLAR_SIMULATION" });
    }, state.solarSimulation.speedMs);

    return () => clearInterval(interval);
  }, [
    state.solarSimulation.isPlaying,
    state.solarSimulation.speedMs,
    dispatch,
  ]);

  const handleOpenHubModal = (hubId) => {
    setSelectedHubId(hubId);
    setHubModalOpen(true);
  };

  return (
    <>
      <section className="section" id="dashboard">
        <div className="section-header">
          <h1>Smart Renewable Energy Management</h1>
          <div className="live-indicator">
            <span className="pulse" /> Live Data
          </div>
        </div>
        <p className="dashboard-intro">
          An integrated platform for monitoring renewable energy generation,
          centralized collection, battery storage, grid distribution,
          infrastructure health, and intelligent maintenance.
        </p>

        <KPICards />

        <div className="dashboard-grid">
          <EnergyMix />
        </div>
        <EnergyHubFlow onHubClick={handleOpenHubModal} />
      </section>

      <MaintenanceAlerts />
      <HubDetailsModal
        isOpen={hubModalOpen}
        onClose={() => setHubModalOpen(false)}
        hubId={selectedHubId}
      />
    </>
  );
}
