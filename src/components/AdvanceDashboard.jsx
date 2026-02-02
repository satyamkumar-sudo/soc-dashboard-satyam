import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  Users,
  Globe,
  Activity,
  TrendingUp,
  Filter,
  Calendar,
  ToggleRight,
  ToggleLeft,
  Bot,
  X,
} from "lucide-react";
import AnomalyTable from "./AnomalyTable";
import TimelineChart from "./TimelineChart";
import ThreatPieChart from "./ThreatPieChart";
import IAMTable from "./IAMTable";
import AttackHeatmap from "./AttackHeatmap";
import NetworkTrafficChart from "./NetworkTrafficChart";
import TopAttackersChart from "./TopAttackersChart";
import SecurityPostureRadar from "./SecurityPostureRadar";
import LiveEventStream from "./LiveEventStream";
import { generateMockLogs, detectAnomalies } from "../data/mockData";
import StatCard from "./StatCard";
import D3SankeyDiagram from "./D3SankeyDiagram";
import FurySankey from "./FurySankey";
// import { data } from "../data/apiData";

import NotificationBell from "./NotificationBell";
import NotificationTray from "./NotificaitonTray";
import AIChatAgentWithData from "./AIChatAgentWithData";

function AdvancedDashboard({ toggleDashboard, isAdvanced, data = {} }) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  //   const [logs, setLogs] = useState([]);
  //   const [anomalies, setAnomalies] = useState([]);
  //   const [iamChanges, setIamChanges] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [severityFilter, setSeverityFilter] = useState("all");
  console.log(data?.logs, "data");
  const {
    logs = [],
    anomalies = [],
    iamChanges = [],
    threatDistribution = {},
    topAttackSources = [],
    securityPosture = {},
    networkTraffic = {},
    attackPatternHeatmap = {},
    networkFlow = [],
    stats = {
      criticalThreats: 0,
      failedLogins: 0,
      iamChanges: 0,
      attackSources: 0,
      eventsPerHour: 0,
    },
    securityEventsTimeline = [],
  } = data ?? {};

  useEffect(() => {
    setTimeout(() => {
      const mockLogs = data?.logs;
      //   setLogs(mockLogs);
      const detected = data;
      //   setAnomalies(detected.anomalies);
      //   setIamChanges(detected.iamChanges);

      setLoading(false);
    }, 1500);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());

      // Occasionally add a new anomaly (15% chance)
      if (Math.random() > 0.85 && anomalies.length < 20) {
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
            "privilege_escalation",
          ][Math.floor(Math.random() * 5)],
          description: "New threat detected",
          user: `user${Math.floor(Math.random() * 10)}@company.com`,
          sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          confidence: 75 + Math.floor(Math.random() * 20),
        };
        // setAnomalies((prev) => [newAnomaly, ...prev]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [anomalies?.length]);

  // Filter anomalies based on severity
  const filteredAnomalies = useMemo(() => {
    if (severityFilter === "all") return anomalies;
    return anomalies.filter((a) => a.severity === severityFilter);
  }, [anomalies, severityFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">
            Initializing Security Operations Center...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Loading threat intelligence data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Enterprise SOC Dashboard
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Real-time threat monitoring • Last updated:{" "}
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Chat Button */}
              <button
                onClick={() => setAiChatOpen(!aiChatOpen)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  aiChatOpen
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <Bot className="w-5 h-5" />
                <span className="text-sm font-medium">AI Assistant</span>
                {aiChatOpen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>

              <NotificationBell onClick={() => setTrayOpen(true)} />
              <NotificationTray
                open={trayOpen}
                onClose={() => setTrayOpen(false)}
              />

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

              {/* Time range selector */}
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setTimeRange("1h")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    timeRange === "1h"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  1H
                </button>
                <button
                  onClick={() => setTimeRange("24h")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    timeRange === "24h"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  24H
                </button>
                <button
                  onClick={() => setTimeRange("7d")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    timeRange === "7d"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  7D
                </button>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-400">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI Chat Panel Overlay */}
      {aiChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[80vh] m-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Close button */}
            <button
              onClick={() => setAiChatOpen(false)}
              className="absolute -top-12 right-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Close</span>
            </button>

            {/* Chat component */}
            <AIChatAgentWithData 
              networkFlow={networkFlow} 
              logs={logs} 
            />
          </div>
        </div>
      )}

      <div className="p-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
            title="Total Threads"
            value={stats.totalEvents}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="blue"
            trend={stats.totalEvents > 1000 ? "up" : "down"}
          />
          <StatCard
            title="Critical Threats"
            value={data?.stats?.criticalThreats}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            trend={data?.stats?.criticalThreats > 1000 ? "up" : "down"}
          />

          {/* <StatCard
            title="Failed Logins" 
            value={data?.stats?.failedLogins}
            icon={<Users className="w-6 h-6" />}
            color="yellow"
            trend={stats.failedLogins > 100 ? "up" : "down"}
          /> */}

          <StatCard
            title="IAM Changes"
            value={stats.iamChanges}
            icon={<Shield className="w-6 h-6" />}
            color="blue"
            trend="neutral"
          />

          <StatCard
            title="Attack Sources"
            value={stats.attackSources}
            icon={<Globe className="w-6 h-6" />}
            color="orange"
            trend={stats.attackSources > 1 ? "up" : "neutral"}
          />

          <StatCard
            title="Events / Hour"
            value={stats.eventsPerHour}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
            trend={stats.eventsPerHour > 20 ? "up" : "down"}
          />
        </div>

        {/* AI Anomaly Detection Section with Filter */}
        <div className="mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI-Detected Anomalies</h2>
                  <p className="text-slate-400 text-sm">
                    Machine learning powered threat analysis
                  </p>
                </div>
              </div>

              {/* Severity filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="medium">Medium Only</option>
                  <option value="low">Low Only</option>
                </select>
              </div>
            </div>
            <AnomalyTable anomalies={filteredAnomalies} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Network Flow Visualization</h2>
          <D3SankeyDiagram networkFlow={networkFlow} />
        </div>

        {/* Advanced Analytics Grid - Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Network Traffic Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Network Traffic Analysis
            </h2>
            <NetworkTrafficChart logs={networkTraffic} />
          </div>

          {/* Security Posture */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Security Posture Score
            </h2>
            <SecurityPostureRadar
              anomalies={anomalies}
              securityPosture={securityPosture}
              iamChanges={iamChanges}
            />
          </div>
        </div>

        {/* Advanced Analytics Grid - Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Security Events Timeline</h2>
            <TimelineChart logs={securityEventsTimeline} />
          </div>

          {/* Threat Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Threat Distribution</h2>
            <ThreatPieChart threatDistribution={threatDistribution} />
          </div>

          {/* Top Attackers */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Top Attack Sources</h2>
            <TopAttackersChart topAttackSources={topAttackSources} />
          </div>
        </div>

        {/* Advanced Analytics Grid - Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Attack Heatmap */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Attack Pattern Heatmap
            </h2>
            <AttackHeatmap heatmap={attackPatternHeatmap} />
          </div>

          {/* Live Event Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <LiveEventStream logs={logs} anomalies={anomalies} />
          </div>
        </div>

        {/* IAM Changes Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Recent IAM Changes</h2>
          <IAMTable changes={iamChanges} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Enterprise SOC Dashboard v2.0 • Powered by AI/ML anomaly detection
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>{anomalies.length} threats detected</span>
            <span>•</span>
            <span>{logs.length} events processed</span>
            <span>•</span>
            <span className="text-green-500">System Healthy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdvancedDashboard;