import { Bell } from "lucide-react";
import { useAlerts } from "../context/AlertContext";

const NotificationBell = ({ onClick }) => {
  const { unread } = useAlerts();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-slate-800"
    >
      <Bell className="w-5 h-5 text-slate-300" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1.5 rounded-full">
          {unread}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
