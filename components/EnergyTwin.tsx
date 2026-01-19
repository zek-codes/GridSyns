import React from 'react';
import { Sun, Battery, Zap, Home, Car, AlertTriangle } from 'lucide-react';
import { useEnergySimulation } from '../hooks/useEnergySimulation';
import clsx from 'clsx';

const FlowLine: React.FC<{ active: boolean; reverse?: boolean; vertical?: boolean; speed?: 'fast' | 'slow' }> = ({ active, reverse, vertical, speed = 'slow' }) => {
  if (!active) return <div className={clsx("bg-gray-700 opacity-20", vertical ? "w-1 h-24" : "h-1 w-24")} />;
  
  return (
    <div className={clsx("relative overflow-hidden bg-gray-700", vertical ? "w-1 h-24" : "h-1 w-24")}>
      <div 
        className={clsx(
            "absolute bg-white opacity-60",
            vertical ? "w-full h-1/2" : "h-full w-1/2",
            vertical 
                ? (reverse ? "animate-flow-up" : "animate-flow-down") 
                : (reverse ? "animate-flow-left" : "animate-flow-right"),
            speed === 'fast' && "duration-700"
        )}
      />
    </div>
  );
};

export const EnergyTwin: React.FC = () => {
  const { solarOutput, load, batterySoC, gridStatus, netGridFlow, batteryFlow } = useEnergySimulation();

  return (
    <div className="relative p-8 bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
      
      {/* Top: Solar */}
      <div className="flex flex-col items-center mb-4">
        <div className={clsx("p-4 rounded-full border-2 transition-all duration-500", solarOutput > 0.1 ? "bg-emerald-900/30 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]" : "bg-gray-800 border-gray-600")}>
            <Sun className={clsx("w-8 h-8", solarOutput > 0.1 ? "text-emerald-400 animate-pulse" : "text-gray-500")} />
        </div>
        <span className="mt-2 text-emerald-400 font-mono font-bold">{solarOutput.toFixed(2)} kW</span>
        <span className="text-xs text-gray-500">Solar Gen</span>
      </div>

      {/* Connection: Solar to House */}
      <FlowLine active={solarOutput > 0.1} vertical speed="fast" />

      <div className="flex items-center w-full justify-center gap-4">
        
        {/* Left: Battery */}
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
                 <div className="flex flex-col items-end mr-2">
                    <span className={clsx("font-mono font-bold", batteryFlow > 0 ? "text-emerald-400" : (batteryFlow < 0 ? "text-cyan-400" : "text-gray-400"))}>
                        {Math.abs(batteryFlow).toFixed(2)} kW
                    </span>
                    <span className="text-xs text-gray-500">
                        {batteryFlow > 0.1 ? 'Charging' : (batteryFlow < -0.1 ? 'Discharging' : 'Idle')}
                    </span>
                 </div>
                 <FlowLine active={Math.abs(batteryFlow) > 0.1} reverse={batteryFlow > 0} />
            </div>
            
            <div className="mt-4 p-4 rounded-xl border-2 border-cyan-500/50 bg-gray-800 relative w-32 h-48 flex flex-col justify-end overflow-hidden">
                <div 
                    className="absolute bottom-0 left-0 w-full bg-cyan-500/30 transition-all duration-1000 ease-out"
                    style={{ height: `${batterySoC}%` }}
                />
                 <div className="relative z-10 flex flex-col items-center">
                    <Battery className="w-8 h-8 text-cyan-400 mb-2" />
                    <span className="text-2xl font-bold text-white">{Math.round(batterySoC)}%</span>
                    <span className="text-xs text-cyan-200">13.5 kWh</span>
                 </div>
            </div>
        </div>

        {/* Center: House */}
        <div className="flex flex-col items-center z-10 mx-8">
             <div className="p-6 bg-gray-700 rounded-full border-4 border-gray-600 shadow-xl relative">
                <Home className="w-12 h-12 text-white" />
                {load > 3 && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 p-1 rounded-full animate-bounce">
                        <Car className="w-4 h-4 text-gray-900" />
                    </div>
                )}
             </div>
             <span className="mt-4 text-white font-bold text-lg">{load.toFixed(2)} kW</span>
             <span className="text-xs text-gray-400">Home Load</span>
        </div>

        {/* Right: Grid */}
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                <FlowLine active={Math.abs(netGridFlow) > 0.1 && gridStatus !== 'BLACKOUT'} reverse={netGridFlow < 0} />
                <div className="flex flex-col items-start ml-2">
                    <span className={clsx("font-mono font-bold", netGridFlow > 0 ? "text-rose-400" : (netGridFlow < 0 ? "text-emerald-400" : "text-gray-400"))}>
                         {Math.abs(netGridFlow).toFixed(2)} kW
                    </span>
                    <span className="text-xs text-gray-500">
                        {netGridFlow > 0.1 ? 'Importing' : (netGridFlow < -0.1 ? 'Exporting' : 'Idle')}
                    </span>
                </div>
             </div>

             <div className={clsx("mt-4 p-4 rounded-xl border-2 w-32 h-48 flex flex-col items-center justify-center transition-colors duration-500", 
                 gridStatus === 'CONNECTED' ? "border-rose-500/50 bg-gray-800" : 
                 (gridStatus === 'ISLANDING' ? "border-amber-500/50 bg-amber-900/10" : "border-red-600 bg-red-900/20")
             )}>
                 {gridStatus === 'CONNECTED' ? (
                     <>
                        <Zap className="w-8 h-8 text-rose-500 mb-2" />
                        <span className="text-rose-400 font-bold">GRID</span>
                        <span className="text-xs text-gray-500 mt-2">Connected</span>
                     </>
                 ) : (
                     <>
                        <AlertTriangle className={clsx("w-8 h-8 mb-2", gridStatus === 'ISLANDING' ? "text-amber-500" : "text-red-500 animate-pulse")} />
                        <span className={clsx("font-bold text-center", gridStatus === 'ISLANDING' ? "text-amber-500" : "text-red-500")}>
                            {gridStatus === 'ISLANDING' ? 'ISLAND MODE' : 'BLACKOUT'}
                        </span>
                     </>
                 )}
             </div>
        </div>

      </div>

      <style>{`
        @keyframes flow-right { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes flow-left { 0% { left: 100%; } 100% { left: -100%; } }
        @keyframes flow-down { 0% { top: -100%; } 100% { top: 100%; } }
        @keyframes flow-up { 0% { top: 100%; } 100% { top: -100%; } }
        .animate-flow-right { animation: flow-right 1s linear infinite; }
        .animate-flow-left { animation: flow-left 1s linear infinite; }
        .animate-flow-down { animation: flow-down 1s linear infinite; }
        .animate-flow-up { animation: flow-up 1s linear infinite; }
      `}</style>
    </div>
  );
};
