import React from 'react';
import { AlertCircle, AlertTriangle, Info, Shield } from 'lucide-react';

const AnomalyTable = ({ anomalies }) => {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-500',
          label: '🔴 Critical'
        };
      case 'medium':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-500',
          label: '🟡 Medium'
        };
      case 'low':
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-500',
          label: '🟢 Low'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/30',
          textColor: 'text-slate-500',
          label: '⚪ Unknown'
        };
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      brute_force: 'Brute Force Attack',
      unusual_login: 'Unusual Login Pattern',
      geo_anomaly: 'Geographic Anomaly',
      iam_suspicious: 'Suspicious IAM Change',
      privilege_escalation: 'Privilege Escalation'
    };
    return labels[type] || type;
  };

  if (anomalies.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">No anomalies detected</p>
        <p className="text-sm">System is secure</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Severity</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Type</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Description</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">User</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Source IP</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Confidence</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Time</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.slice(0, 10).map((anomaly) => {
            const config = getSeverityConfig(anomaly.severity);
            return (
              <tr 
                key={anomaly.id} 
                className={`border-b border-slate-800/50 hover:${config.bgColor} transition-colors duration-150`}
              >
                <td className="py-3 px-4">
                  <div className={`flex items-center gap-2 ${config.textColor}`}>
                    {config.icon}
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-300 text-sm">
                    {getTypeLabel(anomaly.type)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-300 text-sm">
                    {anomaly.description.slice(0, 30)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-400 text-sm font-mono">
                    {anomaly.user}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-400 text-sm font-mono">
                    {anomaly.sourceIp}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${config.textColor.replace('text', 'bg')} transition-all duration-500`}
                        style={{ width: `${anomaly.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-400 text-sm font-medium min-w-[3rem]">
                      {anomaly.confidence}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-400 text-sm">
                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {anomalies.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">
            View all {anomalies.length} anomalies →
          </button>
        </div>
      )}
    </div>
  );
};

export default AnomalyTable;