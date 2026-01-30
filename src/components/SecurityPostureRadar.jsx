import React, { useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';

const SecurityPostureRadar = ({ anomalies, logs, iamChanges }) => {
  const data = useMemo(() => {
    // Calculate security metrics (0-100 scale)
    const totalLogs = logs.length;
    const failedLogins = logs.filter(l => l.type === 'login_failure').length;
    const criticalThreats = anomalies.filter(a => a.severity === 'critical').length;
    const totalThreats = anomalies.length;
    
    // Higher is better for these metrics
    const calculateScore = (metric, inverse = false) => {
      const score = inverse ? 100 - metric : metric;
      return Math.max(0, Math.min(100, score));
    };
    
    return [
      {
        metric: 'Authentication',
        score: calculateScore(((totalLogs - failedLogins) / totalLogs) * 100),
        fullMark: 100,
      },
      {
        metric: 'Access Control',
        score: calculateScore(Math.max(0, 100 - (iamChanges.length * 5))),
        fullMark: 100,
      },
      {
        metric: 'Threat Detection',
        score: calculateScore(anomalies.length > 0 ? 85 : 95), // Having anomalies detected is good
        fullMark: 100,
      },
      {
        metric: 'Incident Response',
        score: calculateScore(100 - (criticalThreats * 10), true),
        fullMark: 100,
      },
      {
        metric: 'Network Security',
        score: calculateScore(Math.max(0, 100 - (totalThreats * 3))),
        fullMark: 100,
      },
      {
        metric: 'Compliance',
        score: calculateScore(Math.random() * 20 + 75), // Mock compliance score
        fullMark: 100,
      },
    ];
  }, [anomalies, logs, iamChanges]);

  const averageScore = useMemo(() => {
    return Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length);
  }, [data]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Weak';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-1">{data.metric}</p>
          <p className="text-sm">
            Score: <span className={`font-bold ${getScoreColor(data.score)}`}>
              {data.score.toFixed(1)}
            </span> / {data.fullMark}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Status: {getScoreLabel(data.score)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Overall security score */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-slate-300 font-semibold">Overall Security Posture</span>
          </div>
          <div className="flex items-center gap-1">
            {averageScore >= 75 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>
            {averageScore}
          </span>
          <span className="text-slate-400">/100</span>
          <span className={`ml-2 text-sm font-semibold ${getScoreColor(averageScore)}`}>
            {getScoreLabel(averageScore)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              averageScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              averageScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
            style={{ width: `${averageScore}%` }}
          ></div>
        </div>
      </div>
      
      {/* Radar chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar 
              name="Security Score" 
              dataKey="score" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Metric breakdown */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{item.metric}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    item.score >= 80 ? 'bg-green-500' :
                    item.score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
              <span className={`font-semibold w-10 text-right ${getScoreColor(item.score)}`}>
                {item.score.toFixed(0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityPostureRadar;