import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NetworkTrafficChart = ({ logs }) => {
  const data = useMemo(() => {
    const hourlyData = {};
    const now = new Date();
    
    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now - i * 60 * 60 * 1000);
      const key = hour.getHours();
      hourlyData[key] = {
        hour: `${String(key).padStart(2, '0')}:00`,
        inbound: 0,
        outbound: 0,
        blocked: 0,
        total: 0
      };
    }
    
    // Process logs
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      if (hourlyData[hour]) {
        // Simulate different traffic types
        if (log.type === 'login_failure') {
          hourlyData[hour].blocked += 1;
        } else if (log.type === 'login_success') {
          hourlyData[hour].inbound += 1;
        } else if (log.type === 'iam_change') {
          hourlyData[hour].outbound += 1;
        }
        hourlyData[hour].total += 1;
      }
    });
    
    return Object.values(hourlyData);
  }, [logs]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
            </p>
          ))}
          <p className="text-slate-400 text-xs mt-2 border-t border-slate-700 pt-1">
            Total: {total} requests
          </p>
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <div className="w-full">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-slate-400">Inbound</span>
          </div>
          <div className="text-xl font-bold text-blue-400">
            {data.reduce((sum, d) => sum + d.inbound, 0)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-400">Outbound</span>
          </div>
          <div className="text-xl font-bold text-green-400">
            {data.reduce((sum, d) => sum + d.outbound, 0)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-slate-400">Blocked</span>
          </div>
          <div className="text-xl font-bold text-red-400">
            {data.reduce((sum, d) => sum + d.blocked, 0)}
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="hour" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              domain={[0, maxValue + 5]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="square"
            />
            <Area 
              type="monotone" 
              dataKey="blocked" 
              stackId="1"
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorBlocked)"
              name="Blocked Traffic"
            />
            <Area 
              type="monotone" 
              dataKey="inbound" 
              stackId="1"
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorInbound)"
              name="Inbound Traffic"
            />
            <Area 
              type="monotone" 
              dataKey="outbound" 
              stackId="1"
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorOutbound)"
              name="Outbound Traffic"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkTrafficChart;