import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ logs }) => {
  // Process logs into hourly buckets
  const processData = () => {
    const hourlyData = {};
    const now = new Date();
    
    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now - i * 60 * 60 * 1000);
      const key = hour.getHours();
      hourlyData[key] = {
        hour: `${key}:00`,
        failed_logins: 0,
        iam_changes: 0,
        anomalies: 0
      };
    }
    
    // Count events per hour
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      if (hourlyData[hour]) {
        if (log.type === 'login_failure') {
          hourlyData[hour].failed_logins++;
        } else if (log.type === 'iam_change') {
          hourlyData[hour].iam_changes++;
        } else if (log.type === 'anomaly') {
          hourlyData[hour].anomalies++;
        }
      }
    });
    
    return Object.values(hourlyData);
  };

  const data = processData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="hour" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="failed_logins" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Failed Logins"
            dot={{ fill: '#ef4444', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="iam_changes" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="IAM Changes"
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="anomalies" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Anomalies"
            dot={{ fill: '#f59e0b', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;