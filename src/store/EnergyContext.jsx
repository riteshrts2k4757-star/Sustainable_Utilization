import { createContext, useContext, useReducer } from "react";

/* ── Source definitions ── */
export const SOURCES = {
  solar: {
    label: "Solar Farm",
    icon: "☀️",
    color: "var(--solar-color)",
    capacity: 800,
  },
  wind: {
    label: "Wind Farm",
    icon: "💨",
    color: "var(--wind-color)",
    capacity: 600,
  },
  hydro: {
    label: "Hydro Plant",
    icon: "💧",
    color: "var(--hydro-color)",
    capacity: 500,
  },
};

/* ── Hub definitions ── */
export const HUBS = {
  hubA: {
    id: "hubA",
    name: "Northern Collector",
    shortName: "Hub A",
    sources: ["solar", "wind"],
    color: "var(--accent-green)",
  },
  hubB: {
    id: "hubB",
    name: "Southern Collector",
    shortName: "Hub B",
    sources: ["hydro"],
    color: "var(--accent-blue)",
  },
};

/* ── Maintenance Alert definitions ── */
const ALERT_RULES = [
  {
    id: "solar_clean",
    source: "solar",
    label: "🧹 Solar Panel Cleaning Required",
    reason: "Panel efficiency has decreased due to dust/debris buildup.",
    priority: "warning",
    recommendedAction: "Dispatch maintenance team to clean solar arrays.",
    check: (src) => src.generation / src.capacity < 0.6,
  },
  {
    id: "wind_repair",
    source: "wind",
    label: "🔧 Wind Turbine Inspection Required",
    reason: "Abnormal vibration detected in turbine gearbox.",
    priority: "critical",
    recommendedAction:
      "Halt turbine and schedule immediate mechanical inspection.",
    check: (src) => src.generation / src.capacity < 0.3,
  },
  {
    id: "hydro_maint",
    source: "hydro",
    label: "💧 Hydro Plant Maintenance",
    reason: "Efficiency below expected level. Possible intake blockage.",
    priority: "warning",
    recommendedAction: "Inspect turbine and water-flow intake system.",
    check: (src) => src.generation / src.capacity < 0.4,
  },
];

/* ── CO2 factor: kg saved per kW-hour equivalent ── */
const CO2_FACTOR = 0.72;

/* ── Solar Mathematical Simulation Helpers ── */
export function formatTime(slot) {
  const totalMinutes = slot * 5;
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function calculateSolarIntensity(
  slot,
  cloudFactor,
  maxIntensity,
  sunrise,
  sunset,
) {
  const t = slot * 5;
  if (t < sunrise || t > sunset) return 0;

  const midpoint = (sunrise + sunset) / 2;
  const halfWidth = (sunset - sunrise) / 2;

  // Sine curve normalized to 0-1
  const curve = Math.cos(((t - midpoint) / halfWidth) * (Math.PI / 2));

  // Apply cloud factor
  const actualIntensity = Math.max(0, maxIntensity * curve * cloudFactor);
  return actualIntensity;
}

/* ── Initial state (AI-Ready Architecture) ── */
const initialState = {
  // 0. Solar Mathematical Simulation
  solarSimulation: {
    currentSlot: 144, // 12:00
    intervalMinutes: 5,
    sunrise: 360, // 06:00
    sunset: 1110, // 18:30
    maxIntensity: 1000,
    cloudFactor: 1.0,
    isPlaying: false,
    speedMs: 1000,
    intensity: 1000, // Initial 12:00 value (assuming clear day)
  },
  // 1. Data Collection: Generation Sources
  sources: {
    solar: {
      generation: 450,
      capacity: 800,
      panels: 12000,
      efficiency: 92,
      maintenanceStatus: "Normal",
    },
    wind: {
      generation: 320,
      capacity: 600,
      turbines: 120,
      efficiency: 88,
      maintenanceStatus: "Normal",
    },
    hydro: {
      generation: 280,
      capacity: 500,
      efficiency: 95,
      maintenanceStatus: "Normal",
    },
  },

  // 2. Data Collection: Consumption
  consumption: 1200,
  regions: [
    { name: "Northern Region", demand: 312 },
    { name: "Southern Region", demand: 260 },
    { name: "Eastern Region", demand: 208 },
    { name: "Western Region", demand: 180 },
    { name: "Central Region", demand: 240 },
  ],

  // 3. Storage & Distribution: Hubs & Batteries
  hubs: {
    hubA: {
      batteries: [
        {
          id: "B1",
          capacity: 1000,
          stored: 780,
          health: 98,
          temperature: 24,
          cycles: 1102,
          status: "charging",
          rate: 40,
        },
        {
          id: "B2",
          capacity: 1000,
          stored: 640,
          health: 95,
          temperature: 25,
          cycles: 1250,
          status: "charging",
          rate: 40,
        },
        {
          id: "B3",
          capacity: 1000,
          stored: 910,
          health: 99,
          temperature: 22,
          cycles: 800,
          status: "standby",
          rate: 0,
        },
      ],
    },
    hubB: {
      batteries: [
        {
          id: "B1",
          capacity: 750,
          stored: 500,
          health: 96,
          temperature: 26,
          cycles: 1389,
          status: "idle",
          rate: 30,
        },
        {
          id: "B2",
          capacity: 750,
          stored: 400,
          health: 92,
          temperature: 27,
          cycles: 1500,
          status: "idle",
          rate: 30,
        },
        {
          id: "B3",
          capacity: 750,
          stored: 700,
          health: 99,
          temperature: 23,
          cycles: 400,
          status: "idle",
          rate: 30,
        },
      ],
    },
  },

  // 4. Grid Connection
  gridFrequency: 50.0,
  transferMode: "auto",

  // 5. Historical Data (for future AI prediction models)
  history: {
    generation: [],
    consumption: [],
    battery: [],
    timestamps: [],
  },

  // 6. Logging & Alert System
  logs: [],
  notifications: [
    {
      id: 1,
      title: "System Online",
      msg: "Smart Renewable Energy Management Platform initialized.",
      time: "Just now",
      read: false,
      severity: "info",
    },
  ],
  maintenanceAlerts: [],
  alertCooldowns: {}, // tracks last tick an alert was generated per rule id
};

/* ── Helper to sync aggregate battery from hub batteries (for legacy/KPI support) ── */
function syncAggregateBattery(hubs) {
  let totalCap = 0,
    totalStored = 0,
    totalHealth = 0,
    totalTemp = 0,
    totalCycles = 0,
    totalRate = 0,
    count = 0;
  let anyCharging = false,
    anyDischarging = false;

  Object.values(hubs).forEach((hub) => {
    hub.batteries.forEach((b) => {
      totalCap += b.capacity;
      totalStored += b.stored;
      totalHealth += b.health;
      totalTemp += b.temperature;
      totalCycles += b.cycles;
      totalRate += b.rate;
      count++;
      if (b.status === "charging") anyCharging = true;
      if (b.status === "discharging") anyDischarging = true;
    });
  });

  return {
    capacity: totalCap,
    stored: totalStored,
    health: count > 0 ? Math.round(totalHealth / count) : 100,
    temperature: count > 0 ? Math.round(totalTemp / count) : 25,
    cycles: count > 0 ? Math.round(totalCycles / count) : 0,
    status: anyCharging ? "charging" : anyDischarging ? "discharging" : "idle",
    rate: totalRate,
  };
}

/* ── Reducer ── */
function energyReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_SOLAR_SIMULATION": {
      return {
        ...state,
        solarSimulation: {
          ...state.solarSimulation,
          isPlaying: !state.solarSimulation.isPlaying,
        },
      };
    }

    case "RESET_SOLAR_SIMULATION": {
      const slot = 0; // 00:00
      const sim = state.solarSimulation;
      const intensity = calculateSolarIntensity(
        slot,
        sim.cloudFactor,
        sim.maxIntensity,
        sim.sunrise,
        sim.sunset,
      );
      const generation = 800 * (intensity / sim.maxIntensity); // Capacity is 800

      const newSources = {
        ...state.sources,
        solar: { ...state.sources.solar, generation },
      };

      return {
        ...state,
        sources: newSources,
        solarSimulation: {
          ...sim,
          currentSlot: slot,
          intensity,
          isPlaying: false,
        },
      };
    }

    case "SET_CLOUD_FACTOR": {
      const cloudFactor = action.payload;
      const sim = state.solarSimulation;
      const intensity = calculateSolarIntensity(
        sim.currentSlot,
        cloudFactor,
        sim.maxIntensity,
        sim.sunrise,
        sim.sunset,
      );
      const generation = 800 * (intensity / sim.maxIntensity);

      const newSources = {
        ...state.sources,
        solar: { ...state.sources.solar, generation },
      };

      return {
        ...state,
        sources: newSources,
        solarSimulation: { ...sim, cloudFactor, intensity },
      };
    }

    case "ADVANCE_SOLAR_SIMULATION": {
      const sim = state.solarSimulation;
      const nextSlot = (sim.currentSlot + 1) % 288;
      const intensity = calculateSolarIntensity(
        nextSlot,
        sim.cloudFactor,
        sim.maxIntensity,
        sim.sunrise,
        sim.sunset,
      );
      const generation = 800 * (intensity / sim.maxIntensity);

      const newSources = {
        ...state.sources,
        solar: { ...state.sources.solar, generation },
      };

      // We must calculate totalGen and distribute to batteries, just like SIMULATE_TICK
      let totalGen = Object.values(newSources).reduce(
        (acc, src) => acc + src.generation,
        0,
      );
      const surplus = totalGen - state.consumption;

      const newHubs = { ...state.hubs };
      Object.entries(HUBS).forEach(([hubId, hubDef]) => {
        const hubGen = hubDef.sources.reduce(
          (s, sk) => s + newSources[sk].generation,
          0,
        );
        const hubShare = hubGen / Math.max(1, totalGen);
        const hubTarget = surplus * hubShare * 0.2;

        let remainingTarget = Math.abs(hubTarget);
        const newBatteries = newHubs[hubId].batteries.map((bat) => {
          if (remainingTarget <= 0) return { ...bat, status: "standby" };

          if (hubTarget > 0) {
            const toStore = Math.min(
              remainingTarget,
              bat.capacity - bat.stored,
              bat.rate,
            );
            remainingTarget -= toStore;
            return {
              ...bat,
              stored: bat.stored + toStore,
              status: toStore > 0 ? "charging" : "standby",
            };
          } else {
            const toDischarge = Math.min(remainingTarget, bat.stored, bat.rate);
            remainingTarget -= toDischarge;
            return {
              ...bat,
              stored: bat.stored - toDischarge,
              status: toDischarge > 0 ? "discharging" : "standby",
            };
          }
        });
        newHubs[hubId] = { ...newHubs[hubId], batteries: newBatteries };
      });

      return {
        ...state,
        sources: newSources,
        hubs: newHubs,
        solarSimulation: { ...sim, currentSlot: nextSlot, intensity },
      };
    }

    case "UPDATE_SOURCE": {
      const { source, generation } = action.payload;
      const newSources = { ...state.sources };
      const prev = newSources[source];
      // Bound generation to [0, capacity]
      const newGen = Math.max(0, Math.min(generation, prev.capacity));
      newSources[source] = { ...prev, generation: newGen };
      return { ...state, sources: newSources };
    }

    case "ADD_GENERATION": {
      const { source, amount } = action.payload;
      const newSources = { ...state.sources };
      const prev = newSources[source];
      const newGen = Math.min(prev.generation + amount, prev.capacity);
      newSources[source] = { ...prev, generation: newGen };
      return { ...state, sources: newSources };
    }

    case "SET_CONSUMPTION": {
      return { ...state, consumption: Math.max(0, action.payload) };
    }

    case "HUB_CHARGE": {
      const hubId = action.payload;
      const hub = state.hubs[hubId];
      const hubDef = HUBS[hubId];
      const hubGen = hubDef.sources.reduce(
        (s, sk) => s + state.sources[sk].generation,
        0,
      );
      let remainingCharge = hubGen * 0.3; // Distribute 30% of hub generation to batteries

      const newBatteries = hub.batteries.map((bat) => {
        if (remainingCharge <= 0) return { ...bat, status: "standby" };
        const capacityAvailable = bat.capacity - bat.stored;
        const chargeAmount = Math.min(
          bat.rate,
          remainingCharge,
          capacityAvailable,
        );

        if (chargeAmount > 0) {
          remainingCharge -= chargeAmount;
          return {
            ...bat,
            stored: bat.stored + chargeAmount,
            status: "charging",
          };
        }
        return {
          ...bat,
          status: bat.stored >= bat.capacity ? "standby" : "idle",
        };
      });

      const newHubs = {
        ...state.hubs,
        [hubId]: { ...hub, batteries: newBatteries },
      };

      return {
        ...state,
        hubs: newHubs,
      };
    }

    case "HUB_DISCHARGE": {
      const hubId = action.payload;
      const hub = state.hubs[hubId];

      const newBatteries = hub.batteries.map((bat) => {
        const dischargeAmount = Math.min(bat.rate, bat.stored);
        if (dischargeAmount > 0) {
          return {
            ...bat,
            stored: bat.stored - dischargeAmount,
            status: "discharging",
          };
        }
        return { ...bat, status: "idle" };
      });

      const newHubs = {
        ...state.hubs,
        [hubId]: { ...hub, batteries: newBatteries },
      };
      return { ...state, hubs: newHubs };
    }

    case "HUB_STOP": {
      const hubId = action.payload;
      const hub = state.hubs[hubId];
      const newBatteries = hub.batteries.map((bat) => ({
        ...bat,
        status: "standby",
      }));
      const newHubs = {
        ...state.hubs,
        [hubId]: { ...hub, batteries: newBatteries },
      };
      return { ...state, hubs: newHubs };
    }

    case "SIMULATE_TICK": {
      let totalGen = 0;
      const newSources = { ...state.sources };
      Object.keys(newSources).forEach((key) => {
        const src = newSources[key];

        // Skip adding random variance to solar if simulation is mathematically driving it
        if (key === "solar" && state.solarSimulation.isPlaying) {
          totalGen += src.generation;
          return;
        }

        const variance = (Math.random() - 0.5) * 20;
        const newGen = Math.max(
          10,
          Math.min(src.capacity, src.generation + variance),
        );
        newSources[key] = { ...src, generation: newGen };
        totalGen += newGen;
      });

      const conVariance = (Math.random() - 0.5) * 30;
      const newConsumption = Math.max(
        500,
        Math.min(2000, state.consumption + conVariance),
      );
      const freq = 50 + (Math.random() - 0.5) * 0.1;
      const surplus = totalGen - newConsumption;

      // Hub battery logic - Auto distribute surplus/deficit to batteries
      const newHubs = { ...state.hubs };
      Object.entries(HUBS).forEach(([hubId, hubDef]) => {
        const hubGen = hubDef.sources.reduce(
          (s, sk) => s + newSources[sk].generation,
          0,
        );
        const hubShare = hubGen / Math.max(1, totalGen);
        const hubTarget = surplus * hubShare * 0.2; // Each hub handles its share of 20% of total surplus

        let remainingTarget = Math.abs(hubTarget);
        const newBatteries = newHubs[hubId].batteries.map((bat) => {
          if (remainingTarget <= 0) return { ...bat, status: "standby" };

          if (hubTarget > 0) {
            // Charging
            const toStore = Math.min(
              remainingTarget,
              bat.capacity - bat.stored,
              bat.rate,
            );
            remainingTarget -= toStore;
            return {
              ...bat,
              stored: bat.stored + toStore,
              status: toStore > 0 ? "charging" : "standby",
            };
          } else {
            // Discharging
            const toDischarge = Math.min(remainingTarget, bat.stored, bat.rate);
            remainingTarget -= toDischarge;
            return {
              ...bat,
              stored: bat.stored - toDischarge,
              status: toDischarge > 0 ? "discharging" : "standby",
            };
          }
        });

        newHubs[hubId] = { ...newHubs[hubId], batteries: newBatteries };
      });

      // Maintenance alert checks
      let newAlerts = [...state.maintenanceAlerts];
      let newNotifications = [...state.notifications];
      const newCooldowns = { ...state.alertCooldowns };
      const now = Date.now();

      ALERT_RULES.forEach((rule) => {
        const src = newSources[rule.source];
        if (rule.check(src)) {
          // Only generate if not in cooldown (60 seconds)
          if (!newCooldowns[rule.id] || now - newCooldowns[rule.id] > 60000) {
            const existingIdx = newAlerts.findIndex(
              (a) => a.ruleId === rule.id && !a.resolved,
            );
            if (existingIdx === -1) {
              const alert = {
                id: now + Math.random(),
                ruleId: rule.id,
                source: rule.source,
                label: rule.label,
                reason: rule.reason,
                recommendedAction: rule.recommendedAction,
                severity: rule.priority, // map priority to severity string for backwards compat if needed
                time: new Date().toLocaleTimeString(),
                resolved: false,
                efficiency: ((src.generation / src.capacity) * 100).toFixed(1),
              };
              newAlerts = [alert, ...newAlerts].slice(0, 30);
              newNotifications = [
                {
                  id: now + Math.random(),
                  title: rule.label,
                  msg: `${rule.reason} ${rule.recommendedAction}`,
                  time: "Just now",
                  read: false,
                  severity: rule.priority,
                  type: "maintenance",
                },
                ...newNotifications,
              ].slice(0, 20);
              newCooldowns[rule.id] = now;

              // Mark source status
              newSources[rule.source].maintenanceStatus = "Needs Attention";
            }
          }
        } else {
          newSources[rule.source].maintenanceStatus = "Normal";
        }
      });

      return {
        ...state,
        sources: newSources,
        consumption: Math.round(newConsumption),
        gridFrequency: Math.round(freq * 100) / 100,
        hubs: newHubs,
        maintenanceAlerts: newAlerts,
        notifications: newNotifications,
        alertCooldowns: newCooldowns,
      };
    }

    case "MARK_NOTIF_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n,
        ),
      };
    }

    case "CLEAR_NOTIFICATIONS": {
      return { ...state, notifications: [] };
    }

    case "RESOLVE_ALERT": {
      const alertId = action.payload;
      return {
        ...state,
        maintenanceAlerts: state.maintenanceAlerts.map((a) =>
          a.id === alertId ? { ...a, resolved: true } : a,
        ),
      };
    }

    case "RECORD_HISTORY": {
      const totalGen = getTotalGeneration(state);
      const aggBat = syncAggregateBattery(state.hubs);
      const batPercent = (aggBat.stored / aggBat.capacity) * 100;
      return {
        ...state,
        history: {
          generation: [...state.history.generation, totalGen].slice(-60),
          consumption: [...state.history.consumption, state.consumption].slice(
            -60,
          ),
          battery: [...state.history.battery, batPercent].slice(-60),
          timestamps: [
            ...state.history.timestamps,
            new Date().toLocaleTimeString(),
          ].slice(-60),
        },
      };
    }

    default:
      return state;
  }
}

/* ── Derived selectors ── */
export function getTotalGeneration(state) {
  return Object.values(state.sources).reduce((s, v) => s + v.generation, 0);
}

export function getSurplus(state) {
  return getTotalGeneration(state) - state.consumption;
}

export function getBatteryPercent(state) {
  const aggBat = syncAggregateBattery(state.hubs);
  if (aggBat.capacity === 0) return 0;
  return (aggBat.stored / aggBat.capacity) * 100;
}

export function getHubGeneration(state, hubId) {
  const hubDef = HUBS[hubId];
  return hubDef.sources.reduce((s, sk) => s + state.sources[sk].generation, 0);
}

export function getHubBatteryPercent(state, hubId) {
  const batteries = state.hubs[hubId].batteries;
  const totalCap = batteries.reduce((s, b) => s + b.capacity, 0);
  const totalStored = batteries.reduce((s, b) => s + b.stored, 0);
  if (totalCap === 0) return 0;
  return (totalStored / totalCap) * 100;
}

export function getCO2Saved(source, generation) {
  // 0.72 kg CO2 saved per kWh equivalent
  return (generation * CO2_FACTOR).toFixed(0);
}

export function getEfficiency(generation, capacity) {
  return ((generation / capacity) * 100).toFixed(1);
}

export function getSustainabilityScore(state) {
  const totalGen = getTotalGeneration(state);
  const totalCap = Object.values(state.sources).reduce(
    (s, v) => s + v.capacity,
    0,
  );
  const renewPct = totalGen > 0 ? 100 : 0;
  const efficiency = totalCap > 0 ? (totalGen / totalCap) * 100 : 0;
  const storage = getBatteryPercent(state);
  const surplus = getSurplus(state);
  const stability = Math.max(0, 100 - Math.abs(surplus) / 10);

  return {
    total: Math.round(
      renewPct * 0.3 +
        efficiency * 0.25 +
        Math.min(storage, 100) * 0.2 +
        stability * 0.25,
    ),
    renewable: Math.round(renewPct),
    efficiency: Math.round(efficiency),
    storage: Math.round(Math.min(storage, 100)),
    stability: Math.round(stability),
  };
}

/* ── Context ── */
const EnergyContext = createContext(null);

export function EnergyProvider({ children }) {
  const [state, dispatch] = useReducer(energyReducer, initialState);

  // Expose an aggregate battery view for legacy components that haven't been updated yet
  const aggregateBattery = syncAggregateBattery(state.hubs);
  const stateWithLegacyBat = { ...state, battery: aggregateBattery };

  return (
    <EnergyContext.Provider value={{ state: stateWithLegacyBat, dispatch }}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error("useEnergy must be used inside EnergyProvider");
  return ctx;
}
