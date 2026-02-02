import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { notifyAlert } from "../utils/alertNotifier";

const AlertContext = createContext();

const ALERTS_API = "https://localhost:8443/api/alerts";

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [severityFilter, setSeverityFilter] = useState("all");
  const lastRefreshRef = useRef(0);

  const normalizeAlerts = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((a) => ({
      ...a,
      // normalize fields used by NotificationTray
      id: a?.id ?? a?.alert_id ?? a?._id,
      title: a?.title ?? a?.name ?? a?.summary ?? a?.message ?? "Alert",
      message: a?.message ?? a?.title ?? a?.description ?? "",
      description: a?.description ?? a?.details ?? "",
      risk_level: a?.risk_level ?? a?.severity ?? a?.level ?? "medium",
      created_at: a?.created_at ?? a?.timestamp ?? a?.time ?? new Date().toISOString(),
      status: a?.status ?? "open",
    }));
  };

  const loadAlerts = async (params = {}) => {
    const level = params?.risk_level ?? "all";
    setSeverityFilter(level);

    const url = new URL(ALERTS_API);
    if (level !== "all") url.searchParams.set("risk_level", level);

    const res = await fetch(url.toString());
    const json = await res.json();
    const list = Array.isArray(json)
      ? json
      : Array.isArray(json?.alerts)
        ? json.alerts
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.results)
            ? json.results
            : [];

    const normalized = normalizeAlerts(list);
    setAlerts(normalized);
    setUnread(normalized.filter((a) => a.status === "open").length);
  };

  useEffect(() => {
    // Initial load from Alerts API (tray/list)
    loadAlerts({ risk_level: "all" }).catch((err) => {
      console.error("Alerts API error:", err);
    });

    // WebSocket: toast + sound notifications only
    const socket = new WebSocket("wss://localhost:8443/ws/alerts");

    socket.onopen = () => {
      console.log("✅ Alerts WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        const payload = json?.data ?? json?.alert ?? json;

        const severity =
          payload?.risk_level ?? payload?.severity ?? payload?.level ?? "medium";
        const title = payload?.title ?? payload?.message ?? "New Alert";

        // toast + sound only
        notifyAlert({ title, severity });

        // refresh tray list occasionally (avoid fetch spam if WS is noisy)
        const now = Date.now();
        if (now - lastRefreshRef.current > 1500) {
          lastRefreshRef.current = now;
          loadAlerts({ risk_level: severityFilter }).catch(() => {});
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 Alerts WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [severityFilter]);

  return (
    <AlertContext.Provider value={{ alerts, unread, loadAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
