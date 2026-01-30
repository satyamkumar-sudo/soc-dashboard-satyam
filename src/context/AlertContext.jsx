import React, { createContext, useContext, useEffect, useState } from "react";
import { notifyAlert } from "../utils/alertNotifier";
import { data as mockData } from "../data/apiData";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);

  const loadAlerts = async () => {
    const notifications = mockData.notifications?.alerts;
    setAlerts(notifications);
    setUnread(notifications.filter(a => a.status === "open").length);
  };

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(() => {
      const notifications = mockData.notifications?.alerts;

      setAlerts(prevAlerts => {
        // detect new alerts
        const newAlerts = notifications.filter(
          n => !prevAlerts.some(p => p.id === n.id)
        );

        if (newAlerts.length > 0) {
          notifyAlert({
            title: newAlerts[0].title,
            severity: newAlerts[0].severity
          });
        }

        setUnread(notifications.filter(a => a.status === "open").length);
        return notifications;
      });
    }, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, unread, loadAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
