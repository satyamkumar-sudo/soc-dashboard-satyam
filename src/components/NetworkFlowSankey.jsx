import React, { useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

const NetworkFlowSankey = ({ logs }) => {
  const sankeyData = useMemo(() => {
    // Build nodes and links for Sankey diagram
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    
    // Helper to add or get node index
    const getNodeIndex = (name, category) => {
      const key = `${category}:${name}`;
      if (!nodeMap.has(key)) {
        const index = nodes.length;
        nodes.push({ name, category });
        nodeMap.set(key, index);
      }
      return nodeMap.get(key);
    };
    
    // Process logs to create flows
    const flowCounts = new Map();
    
    logs.forEach(log => {
      // Source IP → Device Type → Telemetry Type flow
      const sourceIP = log.sourceIp || 'unknown';
      const deviceType = determineDeviceType(log);
      const telemetryType = determineTelemetryType(log);
      
      // Create flow key
      const flowKey = `${sourceIP}→${deviceType}→${telemetryType}`;
      flowCounts.set(flowKey, (flowCounts.get(flowKey) || 0) + 1);
      
      // Add nodes
      getNodeIndex(sourceIP, 'source');
      getNodeIndex(deviceType, 'device');
      getNodeIndex(telemetryType, 'telemetry');
    });
    
    // Create links from flow counts
    flowCounts.forEach((value, key) => {
      const [source, device, telemetry] = key.split('→');
      
      // Source → Device link
      links.push({
        source: getNodeIndex(source, 'source'),
        target: getNodeIndex(device, 'device'),
        value: value
      });
      
      // Device → Telemetry link
      links.push({
        source: getNodeIndex(device, 'device'),
        target: getNodeIndex(telemetry, 'telemetry'),
        value: value
      });
    });
    
    // Aggregate duplicate links
    const aggregatedLinks = [];
    const linkMap = new Map();
    
    links.forEach(link => {
      const key = `${link.source}-${link.target}`;
      if (linkMap.has(key)) {
        linkMap.get(key).value += link.value;
      } else {
        const newLink = { ...link };
        linkMap.set(key, newLink);
        aggregatedLinks.push(newLink);
      }
    });
    
    return { nodes, links: aggregatedLinks };
  }, [logs]);

  // Determine device type from log
  const determineDeviceType = (log) => {
    if (log.type === 'iam_change') return 'admin-console';
    if (log.type === 'login_failure') return 'firewall';
    if (log.sourceIp?.startsWith('192.168')) return 'workstation';
    if (log.sourceIp?.startsWith('10.')) return 'server';
    return 'router';
  };

  // Determine telemetry type
  const determineTelemetryType = (log) => {
    if (log.type === 'login_failure') return 'security-logs';
    if (log.type === 'login_success') return 'access-logs';
    if (log.type === 'iam_change') return 'audit-logs';
    return 'network-logs';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2">Flow Details</p>
          <p className="text-sm text-slate-400">
            Events: <span className="text-white font-bold">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate totals
  const totalFlows = sankeyData.links.reduce((sum, link) => sum + link.value, 0);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-xs text-green-400 mb-1">Log Count</div>
          <div className="text-2xl font-bold text-green-500">
            {totalFlows.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg p-3">
          <div className="text-xs text-red-400 mb-1">Flow Count</div>
          <div className="text-2xl font-bold text-red-500">
            {sankeyData.links.length.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-400 mb-1">Peak Load</div>
          <div className="text-2xl font-bold text-purple-500">
            {Math.max(...sankeyData.links.map(l => l.value)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded"></div>
          <span className="text-slate-400">Device</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded"></div>
          <span className="text-slate-400">Device Type</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded"></div>
          <span className="text-slate-400">Telemetry Type</span>
        </div>
      </div>

      {/* Note about Sankey */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-300">
          ⚠️ <strong>Note:</strong> Sankey diagrams require the <code className="bg-slate-900 px-2 py-0.5 rounded">recharts</code> library, 
          but the Sankey component is still experimental. For a production implementation, consider using:
        </p>
        <ul className="mt-2 ml-4 text-xs text-slate-400 list-disc">
          <li><strong>react-vis</strong> - Uber's visualization library with Sankey support</li>
          <li><strong>d3-sankey</strong> - D3.js Sankey plugin (most powerful)</li>
          <li><strong>plotly.js</strong> - Has built-in Sankey charts</li>
        </ul>
      </div>

      {/* Placeholder visualization */}
      <div className="flex-1 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">Sankey Flow Diagram</h3>
          <p className="text-slate-400 text-sm max-w-md">
            Network flow visualization showing data paths from sources through devices to telemetry endpoints.
            Install a Sankey-compatible library to render the interactive diagram.
          </p>
          <div className="mt-4 text-xs text-slate-500">
            {totalFlows.toLocaleString()} total flows across {sankeyData.nodes.length} nodes
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkFlowSankey;