import React from 'react';
import { Shield, User, Key, Clock } from 'lucide-react';

const IAMTable = ({ changes }) => {
  const getActionIcon = (action) => {
    if (action.includes('Create')) return <User className="w-4 h-4" />;
    if (action.includes('Delete')) return <User className="w-4 h-4" />;
    if (action.includes('SetIamPolicy')) return <Shield className="w-4 h-4" />;
    if (action.includes('Key')) return <Key className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getActionColor = (action) => {
    if (action.includes('Delete')) return 'text-red-500';
    if (action.includes('Create')) return 'text-green-500';
    if (action.includes('SetIamPolicy')) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const isOutsideBusinessHours = (timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    // Weekend or outside 8am-6pm
    return day === 0 || day === 6 || hour < 8 || hour > 18;
  };

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No IAM changes in the last 24 hours</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-64">
      <table className="w-full">
        <thead className="sticky top-0 bg-slate-900">
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Action</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Changed By</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Resource</th>
            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Time</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change, index) => {
            const outsideHours = isOutsideBusinessHours(change.timestamp);
            return (
              <tr 
                key={index} 
                className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                  outsideHours ? 'bg-yellow-500/5' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className={`flex items-center gap-2 ${getActionColor(change.action)}`}>
                    {getActionIcon(change.action)}
                    <span className="text-sm font-medium">{change.action}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-300 text-sm font-mono">
                    {change.changedBy}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-400 text-sm font-mono truncate max-w-xs block">
                    {change.resource}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {outsideHours && (
                      <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-0.5 rounded">
                        Off Hours
                      </span>
                    )}
                    <span className="text-slate-400 text-sm">
                      {new Date(change.timestamp).toLocaleString()}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IAMTable;