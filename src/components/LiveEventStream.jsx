import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const LiveEventStream = ({ logs, anomalies }) => {
  const [events, setEvents] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    // Combine and sort all events
    const allEvents = [
      ...logs.map(log => ({
        ...log,
        eventType: 'log'
      })),
      ...anomalies.map(anomaly => ({
        ...anomaly,
        eventType: 'anomaly'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50); // Keep last 50 events

    setEvents(allEvents);
  }, [logs, anomalies]);

  useEffect(() => {
    if (!isPaused && streamRef.current) {
      streamRef.current.scrollTop = 0;
    }
  }, [events, isPaused]);

  const getEventIcon = (event) => {
    if (event.eventType === 'anomaly') {
      if (event.severity === 'critical') {
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      } else if (event.severity === 'medium') {
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      }
      return <Info className="w-4 h-4 text-blue-500" />;
    }
    
    if (event.type === 'login_failure') {
      return <XCircle className="w-4 h-4 text-red-400" />;
    } else if (event.type === 'login_success') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <Info className="w-4 h-4 text-slate-400" />;
  };

  const getEventColor = (event) => {
    if (event.eventType === 'anomaly') {
      if (event.severity === 'critical') return 'border-red-500/30 bg-red-500/5';
      if (event.severity === 'medium') return 'border-yellow-500/30 bg-yellow-500/5';
      return 'border-blue-500/30 bg-blue-500/5';
    }
    
    if (event.type === 'login_failure') return 'border-red-500/20 bg-red-500/5';
    if (event.type === 'login_success') return 'border-green-500/20 bg-green-500/5';
    return 'border-slate-700 bg-slate-800/30';
  };

  const getEventDescription = (event) => {
    if (event.eventType === 'anomaly') {
      return event.description;
    }
    
    if (event.type === 'login_failure') {
      return `Failed login attempt from ${event.sourceIp}`;
    } else if (event.type === 'login_success') {
      return `Successful login from ${event.sourceIp}`;
    } else if (event.type === 'iam_change') {
      return `IAM change: ${event.method}`;
    }
    return 'Security event';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-300">Live Event Stream</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">Live</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`text-xs px-3 py-1 rounded ${
            isPaused 
              ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          } hover:bg-slate-700 transition-colors`}
        >
          {isPaused ? 'Paused' : 'Pause'}
        </button>
      </div>
      
      {/* Event stream */}
      <div 
        ref={streamRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
        style={{ maxHeight: '400px' }}
      >
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No events yet</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id || index}
              className={`p-3 rounded-lg border ${getEventColor(event)} transition-all hover:bg-slate-800/50 animate-fadeIn`}
              style={{
                animationDelay: `${index * 0.05}s`,
                animationDuration: '0.3s'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getEventIcon(event)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-slate-200 line-clamp-2">
                      {getEventDescription(event)}
                    </p>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {event.user && (
                      <span className="font-mono truncate">{event.user}</span>
                    )}
                    {event.sourceIp && event.sourceIp !== 'multiple' && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{event.sourceIp}</span>
                      </>
                    )}
                    {event.eventType === 'anomaly' && event.confidence && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400">{event.confidence}% confidence</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer stats */}
      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-slate-500 mb-1">Total Events</div>
          <div className="text-white font-bold">{events.length}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-500 mb-1">Critical</div>
          <div className="text-red-500 font-bold">
            {events.filter(e => e.severity === 'critical' || e.type === 'login_failure').length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-500 mb-1">Last Minute</div>
          <div className="text-green-500 font-bold">
            {events.filter(e => {
              const diffMs = new Date() - new Date(e.timestamp);
              return diffMs < 60000;
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveEventStream;