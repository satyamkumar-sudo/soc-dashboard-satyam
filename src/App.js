import React, { useEffect, useState } from "react";
import "./index.css";
import AdvancedDashboard from "./components/AdvanceDashboard";
import Dashboard from "./components/Dashboard";
import { unlockAudio } from "./utils/audioManager";
import { AlertProvider } from "./context/AlertContext";

// const DASHBOARD_API =
//   "https://192.168.50.236:8443/ui/mock-data?hours=24&log_limit=50&anomaly_limit=15&iam_changes_limit=10";
const DASHBOARD_API =
  "https://localhost:8443/ui/soc-dashboard?hours=1";

const NETWORK_FLOW_API =
  "https://localhost:8443/ui/network-flow?hours=1&top_ips=10";

const POLL_INTERVAL = 60_000; // 1 minute

function App() {
  const [isAdvanced, setIsAdvanced] = useState(true);

  // ✅ SINGLE OBJECT for dashboard
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    let isMounted = true;

    // 🔥 DASHBOARD DATA FETCH
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, networkFlowRes] = await Promise.all([
          fetch(DASHBOARD_API),
          fetch(NETWORK_FLOW_API),
        ]);

        const dashboardJson = await dashboardRes.json();
        // normalize common API response wrappers
        const dashboardData =
          dashboardJson?.data ??
          dashboardJson?.result ??
          dashboardJson?.dashboard ??
          dashboardJson?.payload ??
          dashboardJson;

        const networkFlowJson = await networkFlowRes.json();
        const networkFlowData =
          networkFlowJson?.data ??
          networkFlowJson?.result ??
          networkFlowJson?.networkFlow ??
          networkFlowJson?.payload ??
          networkFlowJson;

        const sankeyInput =
          networkFlowData?.sankeyData ??
          networkFlowData?.data?.sankeyData ??
          networkFlowData;

        const merged =
          dashboardData && typeof dashboardData === "object"
            ? {
                ...dashboardData,
                networkFlow: sankeyInput,
              }
            : {
                networkFlow: sankeyInput,
              };

        console.log(merged, "data");
        if (isMounted) {
          setDashboardData(merged);
        }
      } catch (err) {
        console.error("Dashboard API error:", err);
      }
    };

    // initial fetch
    fetchDashboardData();

    // polling
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const toggleDashboard = () => {
    setIsAdvanced((prev) => !prev);
  };

  return (
    <AlertProvider>
      <div
        className="App"
        onMouseDown={unlockAudio}
        onKeyDown={unlockAudio}
        onTouchStart={unlockAudio}
        tabIndex={0}
      >
        {isAdvanced ? (
          <AdvancedDashboard
            toggleDashboard={toggleDashboard}
            isAdvanced={isAdvanced}
            data={dashboardData}
          />
        ) : (
          <Dashboard
            toggleDashboard={toggleDashboard}
            isAdvanced={isAdvanced}
            data={dashboardData}
          />
        )}
      </div>
    </AlertProvider>
  );
}

export default App;
