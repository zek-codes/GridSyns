import React from 'react';
import { useEnergySimulation } from '../hooks/useEnergySimulation';
import { Terminal } from 'lucide-react';
import clsx from 'clsx';

export const AgentLog: React.FC = () => {
  const { logs } = useEnergySimulation();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-64">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-xs font-mono text-gray-400">AGENT_KERNEL_LOGS</span>
      </div>
      <div className="p-4 overflow-y-auto font-mono text-xs space-y-2 scrollbar-hide flex-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in slide-in-from-left duration-300">
            <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
            <span className={clsx(
                "break-words",
                log.type === 'info' && "text-blue-300",
                log.type === 'success' && "text-emerald-300",
                log.type === 'warning' && "text-amber-300",
                log.type === 'error' && "text-rose-300 font-bold"
            )}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <span className="text-gray-600 italic">System initializing... waiting for events.</span>}
      </div>
    </div>
  );
};
