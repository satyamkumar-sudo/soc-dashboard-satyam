import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Users, Globe, ToggleRight, ToggleLeft } from "lucide-react";
import AnomalyTable from "./AnomalyTable";
import TimelineChart from "./TimelineChart";
import IAMTable from "./IAMTable";
import { generateMockLogs, detectAnomalies } from "../data/mockData";
import StatCard from "./StatCard";
import ThreatPieChart from "./ThreatPieChart";

function Dashboard({ toggleDashboard, isAdvanced }) {
  const [logs, setLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [iamChanges, setIamChanges] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);

      const detected = detectAnomalies(mockLogs);
      setAnomalies(detected.anomalies);
      setIamChanges(detected.iamChanges);

      setLoading(false);
    }, 1500);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      if (Math.random() > 0.9 && anomalies.length < 15) {
        const newAnomaly = {
          id: Date.now(),
          timestamp: new Date(),
          severity:
            Math.random() > 0.7
              ? "critical"
              : Math.random() > 0.4
                ? "medium"
                : "low",
          type: [
            "brute_force",
            "unusual_login",
            "geo_anomaly",
            "iam_suspicious",
          ][Math.floor(Math.random() * 4)],
          description: "New threat detected",
          user: `user${Math.floor(Math.random() * 10)}@company.com`,
          sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          confidence: 75 + Math.floor(Math.random() * 20),
        };
        setAnomalies((prev) => [newAnomaly, ...prev]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [anomalies.length]);

  // Calculate stats
  const stats = {
    activeThreats: anomalies.filter((a) => a.severity === "critical").length,
    failedLogins: logs.filter((l) => l.type === "login_failure").length,
    iamChanges: iamChanges.length,
    suspiciousIps: new Set(anomalies.map((a) => a.sourceIp)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">
            Loading Security Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">SOC Security Dashboard</h1>
              <p className="text-slate-400 text-sm">
                Real-time threat monitoring • Last updated:{" "}
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
          <button
            onClick={toggleDashboard}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 shadow-lg transition-all"
          >
            {isAdvanced ? (
              <>
                <ToggleRight className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Advanced Mode</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium">Simple Mode</span>
              </>
            )}
          </button>
         
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-slate-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">System Active</span>
            </div>
          </div>
        </div>
         </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Threats"
          value={stats.activeThreats}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          trend={stats.activeThreats > 0 ? "up" : "down"}
        />
        <StatCard
          title="Failed Logins (24h)"
          value={stats.failedLogins}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
          trend="up"
        />
        <StatCard
          title="IAM Changes (24h)"
          value={stats.iamChanges}
          icon={<Shield className="w-6 h-6" />}
          color="blue"
          trend="neutral"
        />
        <StatCard
          title="Suspicious IPs"
          value={stats.suspiciousIps}
          icon={<Globe className="w-6 h-6" />}
          color="orange"
          trend="up"
        />
      </div>

      {/* AI Anomaly Detection Section */}
      <div className="mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">AI-Detected Anomalies</h2>
              <p className="text-slate-400 text-sm">
                Real-time threat analysis powered by machine learning
              </p>
            </div>
          </div>
          <AnomalyTable anomalies={anomalies} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Security Events Timeline</h2>
          <TimelineChart logs={logs} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Threat Distribution</h2>
          <ThreatPieChart anomalies={anomalies} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent IAM Changes</h2>
          <IAMTable changes={iamChanges} />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-sm">
        <p>
          SOC Dashboard v1.0 • Built with React & AI-powered anomaly detection
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;
