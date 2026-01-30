import {
  X,
  AlertTriangle,
  Bell,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAlerts } from "../context/AlertContext";
import { useState } from "react";

const NotificationTray = ({ open, onClose }) => {
  const { alerts, loadAlerts } = useAlerts();
  const [severity, setSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const applyFilter = (value) => {
    setSeverity(value);
    loadAlerts(value === "all" ? {} : { risk_level: value });
  };

  const getSeverityIcon = (level) => {
    switch (level) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityConfig = (level) => {
    switch (level) {
      case "critical":
        return {
          bg: "bg-gradient-to-r from-red-500/10 to-red-600/10",
          border: "border-red-500/40",
          glow: "shadow-lg shadow-red-500/20",
          badge: "bg-red-500/20 text-red-400 border-red-500/30",
        };
      case "medium":
        return {
          bg: "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10",
          border: "border-yellow-500/40",
          glow: "shadow-lg shadow-yellow-500/20",
          badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      case "low":
        return {
          bg: "bg-gradient-to-r from-green-500/10 to-green-600/10",
          border: "border-green-500/40",
          glow: "shadow-lg shadow-green-500/20",
          badge: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-blue-500/10 to-blue-600/10",
          border: "border-blue-500/40",
          glow: "shadow-lg shadow-blue-500/20",
          badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
    }
  };

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.risk_level === "critical").length,
    medium: alerts.filter((a) => a.risk_level === "medium").length,
    low: alerts.filter((a) => a.risk_level === "low").length,
  };

  return (
    <div>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/70 transition-opacity duration-300 z-[9998]
    ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
  `}
        onClick={onClose}
      />

      {/* Notification Tray */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px]
  bg-slate-950
  border-l border-slate-800
  shadow-[0_0_40px_rgba(0,0,0,0.9)]
  transform transition-transform duration-300 ease-out
  z-[9999]
  ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <div className="relative border-b border-slate-800/80 bg-slate-900/80">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Alerts Center
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time security notifications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 
                         border border-slate-700 transition-all hover:scale-105 group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-2 px-5 pb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {alertCounts.all}
              </div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">
                {alertCounts.critical}
              </div>
              <div className="text-xs text-slate-400">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-500">
                {alertCounts.medium}
              </div>
              <div className="text-xs text-slate-400">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">
                {alertCounts.low}
              </div>
              <div className="text-xs text-slate-400">Low</div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg 
                         text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 
                         focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Filter by Severity
            </span>
          </div>
          <div className="flex gap-2">
            {["all", "critical", "medium", "low"].map((level) => (
              <button
                key={level}
                onClick={() => applyFilter(level)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    severity === level
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 border border-slate-700/50"
                  }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>
                    {level === "all"
                      ? "All"
                      : level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                  {level !== "all" && (
                    <span
                      className={`text-xs ${
                        severity === level ? "text-blue-200" : "text-slate-500"
                      }`}
                    >
                      ({alertCounts[level]})
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alert list */}
        <div className="overflow-y-auto h-[calc(100vh-380px)] p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Bell className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm font-medium">No alerts found</p>
              <p className="text-xs text-slate-600 mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => {
              const config = getSeverityConfig(alert.risk_level);
              return (
                <div
                  key={alert.id}
                  className={`group relative p-4 rounded-xl border 
                              transition-all duration-300 hover:scale-[1.02] cursor-pointer
                              animate-fadeIn ${config.bg} ${config.border} ${config.glow}`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: "0.4s",
                  }}
                >
                  {/* Severity indicator line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                      alert.risk_level === "critical"
                        ? "bg-red-500"
                        : alert.risk_level === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />

                  {/* Content */}
                  <div className="pl-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getSeverityIcon(alert.risk_level)}
                        <h3 className="font-semibold text-sm text-slate-100 group-hover:text-white transition-colors">
                          {alert.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${config.badge}`}
                      >
                        {alert.risk_level?.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {alert.message?.slice(0,50)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span>
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions
        <div
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/80 
                        bg-gradient-to-t from-slate-900 to-slate-900/95"
        >
          <div className="flex gap-2">
            <button
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 
                             rounded-lg text-sm font-medium text-slate-300 transition-all hover:scale-[1.02]"
            >
              Mark All Read
            </button>
            <button
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 
                             hover:to-blue-700 rounded-lg text-sm font-medium text-white transition-all 
                             hover:scale-[1.02] shadow-lg shadow-blue-500/30"
            >
              Clear All
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default NotificationTray;
