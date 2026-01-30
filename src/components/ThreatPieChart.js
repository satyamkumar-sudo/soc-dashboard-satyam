import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ThreatPieChart = ({ anomalies }) => {
  // Process anomalies by severity
  const processData = () => {
    const severityCounts = {
      critical: 0,
      medium: 0,
      low: 0
    };

    anomalies.forEach(anomaly => {
      if (severityCounts.hasOwnProperty(anomaly.severity)) {
        severityCounts[anomaly.severity]++;
      }
    });

    return [
      { name: 'Critical', value: severityCounts.critical, color: '#ef4444' },
      { name: 'Medium', value: severityCounts.medium, color: '#f59e0b' },
      { name: 'Low', value: severityCounts.low, color: '#10b981' }
    ].filter(item => item.value > 0); // Only show non-zero values
  };

  const data = processData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-1">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            Count: {payload[0].value}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {((payload[0].value / anomalies.length) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    return `${entry.name}: ${entry.value}`;
  };

  if (data.length === 0) {
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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Stats below chart */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {data.map((item, index) => (
          <div 
            key={index}
            className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: item.color }}
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