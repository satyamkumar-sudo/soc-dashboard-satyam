import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLOR_MAP = {
  critical: "#ef4444",
  high: "#b91c1c",
  medium: "#f59e0b",
  low: "#10b981",
  default: "#6b7280",
};

const ThreatPieChart = ({ threatDistribution = {} }) => {
  const data = useMemo(() => {
    return Object.entries(threatDistribution)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: Number(value),
        fill: COLOR_MAP[key.toLowerCase()] || COLOR_MAP.default,
      }))
      .filter(d => d.value > 0);
  }, [threatDistribution]);

  const totalThreats = data.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const { name, value, fill } = payload[0].payload;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-slate-300 font-semibold">{name}</p>
        <p className="text-sm font-bold" style={{ color: fill }}>
          Count: {value}
        </p>
        <p className="text-xs text-slate-400">
          {((value / totalThreats) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  };

  if (!data.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-5xl mb-3">🛡️</div>
          <p className="text-lg">No threats detected</p>
          <p className="text-sm">System is secure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={45}
            paddingAngle={3}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          <Legend
            iconType="circle"
            formatter={(value, entry) => (
              <span style={{ color: entry.color || entry.payload.fill }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: item.fill }}
            >
              {item.value}
            </div>
            <div className="text-xs text-slate-400">
              {item.name} Severity
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatPieChart;
