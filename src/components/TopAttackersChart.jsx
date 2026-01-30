import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const TopAttackersChart = ({ topAttackSources }) => {
  if (!topAttackSources || topAttackSources.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No attack sources detected</p>
        </div>
      </div>
    );
  }

  // Sort top attackers by attacks
  const data = [...topAttackSources]
    .sort((a, b) => b.attacks - a.attacks)
    .slice(0, 10)
    .map(item => ({
      ...item,
      shortIp: item.sourceIp.split('.').slice(-2).join('.'),
    }));

  const topAttacker = data[0];

  const getBarColor = (index) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    ];
    return colors[index] || '#64748b';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2 font-mono">{item.sourceIp}</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">
              Total Attacks: <span className="text-white font-bold">{item.attacks}</span>
            </p>
            <p className="text-sm" style={{ color: item.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
              Severity: {item.severity}
            </p>
            <p className="text-sm text-slate-400">
              Services Targeted: {item.servicesTargeted}
            </p>
            <p className="text-sm text-slate-400">
              Status: {item.status}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

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
              {topAttacker.sourceIp}
            </div>
            <div className="text-sm text-slate-400">
              {topAttacker.attacks} attacks • {topAttacker.severity}
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
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              label={{ value: 'Attacks', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '12px' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="attacks" radius={[8, 8, 0, 0]}>
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
            {data.reduce((sum, item) => sum + item.attacks, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopAttackersChart;
