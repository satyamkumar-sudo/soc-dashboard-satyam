import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const TopAttackersChart = ({ anomalies, logs }) => {
  const data = useMemo(() => {
    const ipCounts = {};
    
    // Count threats per IP
    [...anomalies, ...logs.filter(l => l.type === 'login_failure')].forEach(item => {
      const ip = item.sourceIp || 'unknown';
      if (!ipCounts[ip]) {
        ipCounts[ip] = {
          ip,
          threats: 0,
          critical: 0,
          medium: 0,
          low: 0
        };
      }
      ipCounts[ip].threats++;
      
      if (item.severity === 'critical') {
        ipCounts[ip].critical++;
      } else if (item.severity === 'medium') {
        ipCounts[ip].medium++;
      } else {
        ipCounts[ip].low++;
      }
    });
    
    // Sort by threat count and take top 10
    return Object.values(ipCounts)
      .sort((a, b) => b.threats - a.threats)
      .slice(0, 10)
      .map(item => ({
        ...item,
        shortIp: item.ip.split('.').slice(-2).join('.')
      }));
  }, [anomalies, logs]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2 font-mono">{data.ip}</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">
              Total Threats: <span className="text-white font-bold">{data.threats}</span>
            </p>
            {data.critical > 0 && (
              <p className="text-sm text-red-400">
                Critical: {data.critical}
              </p>
            )}
            {data.medium > 0 && (
              <p className="text-sm text-yellow-400">
                Medium: {data.medium}
              </p>
            )}
            {data.low > 0 && (
              <p className="text-sm text-green-400">
                Low: {data.low}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index) => {
    const colors = [
      '#ef4444', // Red
      '#f97316', // Orange
      '#f59e0b', // Amber
      '#eab308', // Yellow
      '#84cc16', // Lime
      '#22c55e', // Green
      '#10b981', // Emerald
      '#14b8a6', // Teal
      '#06b6d4', // Cyan
      '#0ea5e9', // Sky
    ];
    return colors[index] || '#64748b';
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No attack sources detected</p>
        </div>
      </div>
    );
  }

  const topAttacker = data[0];

  return (
    <div className="w-full">
      {/* Top attacker highlight */}
      <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-400 font-semibold">TOP THREAT SOURCE</span>
            </div>
            <div className="text-xl font-bold text-red-500 font-mono mb-1">
              {topAttacker.ip}
            </div>
            <div className="text-sm text-slate-400">
              {topAttacker.threats} attacks • {topAttacker.critical} critical
            </div>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">ACTIVE</span>
          </div>
        </div>
      </div>
      
      {/* Bar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="shortIp" 
              stroke="#64748b"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'Threats', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '12px' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="threats" 
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Stats summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/50 rounded p-2 border border-slate-700/50">
          <div className="text-slate-400 mb-1">Unique Attackers</div>
          <div className="text-lg font-bold text-white">{data.length}</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2 border border-slate-700/50">
          <div className="text-slate-400 mb-1">Total Attacks</div>
          <div className="text-lg font-bold text-white">
            {data.reduce((sum, item) => sum + item.threats, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopAttackersChart;