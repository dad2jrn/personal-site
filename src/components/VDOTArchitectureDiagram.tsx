import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Database,
  Cloud,
  Share2,
  FileText,
  Map,
  Layout,
  Truck
} from 'lucide-react';

const nodes = [
  { id: 'security', label: 'Security', icon: Shield, angle: -135 },
  { id: 'data', label: 'Data', icon: Database, angle: -90 },
  { id: 'cloud', label: 'Cloud', icon: Cloud, angle: -45 },
  { id: 'integration', label: 'Integration', icon: Share2, angle: 0 },
  { id: 'standards', label: 'Standards', icon: FileText, angle: 45 },
  { id: 'roadmaps', label: 'Roadmaps', icon: Map, angle: 90 },
  { id: 'applications', label: 'Applications', icon: Layout, angle: 135 },
  { id: 'delivery', label: 'Delivery', icon: Truck, angle: 180 },
];

const VDOTArchitectureDiagram = () => {
  const radius = 80; // Radius for outer nodes

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#050505] overflow-hidden group">
      {/* Blueprint Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vdot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-teal-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vdot-grid)" />
        </svg>
      </div>

      <div className="relative w-[300px] h-[200px]">
        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 300 200">
          {/* Connector Lines */}
          {nodes.map((node, i) => {
            const x2 = 150 + radius * Math.cos((node.angle * Math.PI) / 180);
            const y2 = 100 + radius * Math.sin((node.angle * Math.PI) / 180);

            return (
              <g key={`line-${node.id}`}>
                <motion.line
                  x1="150"
                  y1="100"
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  className="text-teal-500/30"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
                {/* Pulse Path */}
                <motion.circle
                  r="1.5"
                  fill="#2dd4bf"
                  className="shadow-[0_0_8px_#2dd4bf]"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: "100%",
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 1.5 + i * 0.2,
                    ease: "linear"
                  }}
                  style={{
                    offsetPath: `path('M 150 100 L ${x2} ${y2}')`,
                    offsetRotate: "auto"
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center Component */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative px-4 py-2 bg-teal-950/40 border border-teal-500/50 rounded-md backdrop-blur-sm shadow-[0_0_20px_rgba(45,212,191,0.15)] group-hover:shadow-[0_0_30px_rgba(45,212,191,0.25)] transition-shadow duration-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 whitespace-nowrap">
              Enterprise Architecture
            </span>
            {/* Decorative corners */}
            <div className="absolute -top-px -left-px w-1 h-1 border-t border-l border-teal-400" />
            <div className="absolute -top-px -right-px w-1 h-1 border-t border-r border-teal-400" />
            <div className="absolute -bottom-px -left-px w-1 h-1 border-b border-l border-teal-400" />
            <div className="absolute -bottom-px -right-px w-1 h-1 border-b border-r border-teal-400" />
          </div>
        </motion.div>

        {/* Outer Nodes */}
        {nodes.map((node, i) => {
          const x = 150 + radius * Math.cos((node.angle * Math.PI) / 180);
          const y = 100 + radius * Math.sin((node.angle * Math.PI) / 180);

          return (
            <motion.div
              key={node.id}
              className="absolute z-10"
              style={{ left: x, top: y, x: '-50%', y: '-50%' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="p-1.5 bg-slate-900 border border-teal-500/30 rounded shadow-lg group-hover:border-teal-500/60 transition-colors duration-500">
                  <node.icon size={12} className="text-teal-500/70 group-hover:text-teal-400 transition-colors duration-500" />
                </div>
                <span className="text-[8px] font-medium text-teal-500/50 uppercase tracking-tighter whitespace-nowrap">
                  {node.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default VDOTArchitectureDiagram;