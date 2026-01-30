import React, { useEffect, useState } from "react";
import "./index.css";
import AdvancedDashboard from "./components/AdvanceDashboard";
import Dashboard from "./components/Dashboard";
import { unlockAudio } from "./utils/audioManager";
import { AlertProvider } from "./context/AlertContext";
import { notifyAlert } from "./utils/alertNotifier";

const DASHBOARD_API =
  "https://192.168.50.236:8443/ui/mock-data?hours=24&log_limit=50&anomaly_limit=15&iam_changes_limit=10";

const ALERTS_API = "http://localhost:8088/api/alerts";

const POLL_INTERVAL = 60_000; // 1 minute

function App() {
  const [isAdvanced, setIsAdvanced] = useState(true);

  // ✅ SINGLE OBJECT for dashboard
  const [dashboardData, setDashboardData] = useState({});

  // useEffect(() => {
  //   let isMounted = true;

  //   // 🔥 DASHBOARD DATA FETCH
  //   const fetchDashboardData = async () => {
  //     try {
  //       const res = await fetch(DASHBOARD_API);
  //       const data = await res.json();

  //       if (isMounted) {
  //         setDashboardData(data);
  //       }
  //     } catch (err) {
  //       console.error("Dashboard API error:", err);
  //     }
  //   };

  //   // 🔔 ALERTS FETCH (notifications)
  //   const fetchAlerts = async () => {
  //     try {
  //       const res = await fetch(ALERTS_API);
  //       const alerts = await res.json();

  //       // expecting alerts as array
  //       alerts?.forEach((alert) => {
  //         notifyAlert({
  //           title: alert.title || alert.message || "New Alert",
  //           severity: alert.severity || "medium",
  //         });
  //       });
  //     } catch (err) {
  //       console.error("Alerts API error:", err);
  //     }
  //   };

  //   // initial fetch
  //   fetchDashboardData();
  //   fetchAlerts();

  //   // polling
  //   const intervalId = setInterval(() => {
  //     fetchDashboardData();
  //     fetchAlerts();
  //   }, POLL_INTERVAL);

  //   return () => {
  //     isMounted = false;
  //     clearInterval(intervalId);
  //   };
  // }, []);

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
