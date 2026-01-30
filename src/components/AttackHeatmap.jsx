import React, { useMemo } from 'react';

const AttackHeatmap = ({ logs }) => {
  const heatmapData = useMemo(() => {
    // Create 24-hour x 7-day grid
    const grid = Array(7).fill(null).map(() => Array(24).fill(0));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Count failed logins and anomalies per hour/day
    logs.forEach(log => {
      if (log.type === 'login_failure' || log.type === 'anomaly') {
        const date = new Date(log.timestamp);
        const day = date.getDay();
        const hour = date.getHours();
        grid[day][hour]++;
      }
    });
    
    // Find max for normalization
    const max = Math.max(...grid.flat());
    
    return { grid, max, days };
  }, [logs]);

  const getColor = (value) => {
    if (value === 0) return 'bg-slate-800/30';
    const intensity = value / heatmapData.max;
    if (intensity > 0.8) return 'bg-red-500';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-blue-500';
    return 'bg-blue-400/50';
  };

  const getTooltipText = (day, hour, value) => {
    return `${heatmapData.days[day]} ${hour}:00 - ${value} events`;
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 bg-slate-800/30 rounded"></div>
          <span>No activity</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 bg-blue-400/50 rounded"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>High</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Hour labels */}
          <div className="flex gap-1 ml-12">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="w-6 text-center text-xs text-slate-500">
                {i % 4 === 0 ? i : ''}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {heatmapData.grid.map((row, dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-1">
              <div className="w-10 text-xs text-slate-400 font-medium">
                {heatmapData.days[dayIndex]}
              </div>
              <div className="flex gap-1">
                {row.map((value, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`w-6 h-6 ${getColor(value)} rounded hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer group relative`}
                    title={getTooltipText(dayIndex, hourIndex, value)}
                  >
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap z-10 border border-slate-700">
                      {getTooltipText(dayIndex, hourIndex, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-slate-500">
        <p>Activity pattern over the last 7 days • Darker colors indicate higher attack volume</p>
      </div>
    </div>
  );
};

export default AttackHeatmap;