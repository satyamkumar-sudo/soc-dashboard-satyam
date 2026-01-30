import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';

const D3SankeyDiagram = ({ logs }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  // Helper functions
  const getDeviceType = (log) => {
    if (log.type === 'iam_change') return 'admin-console';
    if (log.type === 'login_failure') return 'firewall';
    if (log.sourceIp?.startsWith('192.168')) return 'workstation';
    if (log.sourceIp?.startsWith('10.')) return 'server';
    return 'router';
  };

  const getTelemetryType = (log) => {
    if (log.type === 'login_failure') return 'security-logs';
    if (log.type === 'login_success') return 'access-logs';
    if (log.type === 'iam_change') return 'audit-logs';
    return 'network-logs';
  };
  const data = useMemo(() => {
    // Prepare Sankey data structure
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    
    // Categories for color coding
    const categories = {
      source: [],
      device: [],
      telemetry: []
    };
    
    // Helper to get or create node
    const getNode = (name, category) => {
      const key = `${category}:${name}`;
      if (!nodeMap.has(key)) {
        const node = { 
          id: nodes.length, 
          name, 
          category,
          displayName: name.length > 15 ? name.substring(0, 12) + '...' : name
        };
        nodes.push(node);
        nodeMap.set(key, node);
        categories[category].push(node);
      }
      return nodeMap.get(key);
    };
    
    // Track flows
    const flowMap = new Map();
    
    // Process logs - take top IPs only to avoid clutter
    const ipCounts = new Map();
    logs.forEach(log => {
      const ip = log.sourceIp || 'unknown';
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    });
    
    // Get top 10 IPs
    const topIPs = Array.from(ipCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip]) => ip);
    
    logs.forEach(log => {
      const sourceIP = log.sourceIp || 'unknown';
      
      // Only process top IPs
      if (!topIPs.includes(sourceIP)) return;
      
      const deviceType = getDeviceType(log);
      const telemetryType = getTelemetryType(log);
      
      // Get nodes
      const sourceNode = getNode(sourceIP, 'source');
      const deviceNode = getNode(deviceType, 'device');
      const telemetryNode = getNode(telemetryType, 'telemetry');
      
      // Create links
      const link1Key = `${sourceNode.id}-${deviceNode.id}`;
      const link2Key = `${deviceNode.id}-${telemetryNode.id}`;
      
      // Increment flow counts
      flowMap.set(link1Key, (flowMap.get(link1Key) || 0) + 1);
      flowMap.set(link2Key, (flowMap.get(link2Key) || 0) + 1);
    });
    
    // Convert flow map to links array
    flowMap.forEach((value, key) => {
      const [source, target] = key.split('-').map(Number);
      links.push({ source, target, value });
    });
    
    return { nodes, links, categories };
  }, [logs]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.nodes.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const width = containerRef.current.offsetWidth;
    const height = 500;
    const margin = { top: 10, right: 150, bottom: 10, left: 150 };

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create Sankey generator
    const sankeyGenerator = d3Sankey()
      .nodeId(d => d.id)
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    // Generate Sankey layout
    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    });

    // Color scale by category
    const colorScale = {
      source: d3.scaleOrdinal()
        .range(['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9']),
      device: d3.scaleOrdinal()
        .range(['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef']),
      telemetry: d3.scaleOrdinal()
        .range(['#ec4899', '#f43f5e', '#e11d48', '#be123c', '#9f1239'])
    };

    // Draw links
    const link = svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', d => {
        const sourceNode = nodes.find(n => n.id === d.source.id);
        return colorScale[sourceNode.category](sourceNode.name);
      })
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => Math.max(1, d.width))
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-opacity', 0.7);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-opacity', 0.3);
      });

    // Add link labels (on hover)
    link.append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} events`);

    // Draw nodes
    const node = svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => colorScale[d.category](d.name))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .attr('rx', 4);

    // Add node labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', '11px')
      .attr('fill', '#cbd5e1')
      .attr('font-family', 'monospace')
      .text(d => d.displayName);

    // Add node titles (tooltips)
    node.append('title')
      .text(d => `${d.name}\n${d.value?.toLocaleString() || 0} events`);

  }, [data]);



  const totalEvents = data.links.reduce((sum, link) => sum + link.value, 0);

  return (
    <div className="w-full h-full flex flex-col" ref={containerRef}>
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-xs text-green-400 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-green-500">
            {totalEvents.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-xs text-blue-400 mb-1">Network Flows</div>
          <div className="text-2xl font-bold text-blue-500">
            {data.links.length.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-400 mb-1">Active Nodes</div>
          <div className="text-2xl font-bold text-purple-500">
            {data.nodes.length}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-slate-400">Source IPs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-slate-400">Device Types</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-500 rounded"></div>
          <span className="text-slate-400">Telemetry Types</span>
        </div>
      </div>

      {/* Sankey diagram */}
      <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 p-4 overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ minHeight: '500px' }}></svg>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-slate-500 text-center">
        Hover over flows and nodes to see details • Showing top 10 source IPs
      </div>
    </div>
  );
};

export default D3SankeyDiagram;