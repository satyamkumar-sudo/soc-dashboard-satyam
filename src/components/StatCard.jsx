import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon,
  color = "blue",
  trend = "neutral",
}) => {
  const colorClasses = {
    red: {
      bg: "from-red-500/20 to-red-600/20",
      border: "border-red-500/30",
      text: "text-red-500",
      glow: "shadow-red-500/20",
    },
    yellow: {
      bg: "from-yellow-500/20 to-yellow-600/20",
      border: "border-yellow-500/30",
      text: "text-yellow-500",
      glow: "shadow-yellow-500/20",
    },
    blue: {
      bg: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/30",
      text: "text-blue-500",
      glow: "shadow-blue-500/20",
    },
    orange: {
      bg: "from-orange-500/20 to-orange-600/20",
      border: "border-orange-500/30",
      text: "text-orange-500",
      glow: "shadow-orange-500/20",
    },
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-red-500" />,
    down: <TrendingDown className="w-4 h-4 text-green-500" />,
    neutral: <Minus className="w-4 h-4 text-slate-500" />,
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg p-6 
                  backdrop-blur-sm hover:scale-105 transition-transform duration-200 
                  shadow-lg ${colors.glow}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.text}`}>{icon}</div>
        {trendIcons[trend]}
      </div>

      <div className="mb-2">
        <div className={`text-3xl font-bold ${colors.text}`}>
          {value.toLocaleString()}
        </div>
      </div>

      <div className="text-slate-400 text-sm font-medium">{title}</div>
    </div>
  );
};

export default StatCard;
