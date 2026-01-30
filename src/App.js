import React, { useEffect, useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import "./index.css";
import AdvancedDashboard from "./components/AdvanceDashboard";
import Dashboard from "./components/Dashboard";
import { notifyAlert } from "./utils/alertNotifier";
import { unlockAudio } from "./utils/audioManager";
import { AlertProvider } from "./context/AlertContext";

function App() {
  const [isAdvanced, setIsAdvanced] = useState(true);
  const triggerAlert = (severity) => {
    notifyAlert({
      title: "Multiple failed login attempts detected",
      severity,
    });
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     notifyAlert({
  //       title: "Suspicious outbound traffic spike",
  //       severity: "critical",
  //     });
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, []);
  const toggleDashboard = () => {
    setIsAdvanced(!isAdvanced);
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
          />
        ) : (
          <Dashboard
            toggleDashboard={toggleDashboard}
            isAdvanced={isAdvanced}
          />
        )}
        <div style={{ padding: 20 }}>
          <button onClick={() => triggerAlert("critical")}>🚨 Critical</button>
          <button onClick={() => triggerAlert("high")}>⚠️ High</button>
          <button onClick={() => triggerAlert("medium")}>ℹ️ Medium</button>
          <button onClick={() => triggerAlert("low")}>✅ Low</button>
        </div>
      </div>
    </AlertProvider>
  );
}

export default App;
