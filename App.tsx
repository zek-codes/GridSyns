import React from 'react';
import { SimulationProvider, useEnergySimulation } from './hooks/useEnergySimulation';
import { EnergyTwin } from './components/EnergyTwin';
import { DashboardCharts } from './components/DashboardCharts';
import { AgentLog } from './components/AgentLog';
import { Controls } from './components/Controls';
import { Scheduler } from './components/Scheduler';
import { ImageGenerator } from './components/ImageGenerator';
import { Zap, Clock, Activity } from 'lucide-react';

const Header: React.FC = () => {
  const { time, gridPrice, gridCarbon } = useEnergySimulation();
  
  const formatTime = (t: number) => {
    const h = Math.floor(t);
    const m = Math.floor((t - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
          <Zap className="text-white w-6 h-6" />
        </div>
        <div>
           <h1 className="text-xl font-bold tracking-tight text-white">GridSync <span className="text-emerald-400">VPP</span></h1>
           <p className="text-xs text-gray-500">AI-Orchestrated Energy Agent</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
         <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-xl text-white font-bold">{formatTime(time)}</span>
         </div>
         <div className="hidden md:block w-px h-8 bg-gray-800" />
         <div className="flex gap-6 text-sm">
             <div>
                <span className="block text-xs text-gray-500">GRID PRICE</span>
                <span className={`font-mono font-bold ${gridPrice > 0.4 ? 'text-red-400' : 'text-emerald-400'}`}>${gridPrice.toFixed(2)}/kWh</span>
             </div>
             <div>
                <span className="block text-xs text-gray-500">CARBON INTENSITY</span>
                <span className={`font-mono font-bold ${gridCarbon > 400 ? 'text-amber-500' : 'text-emerald-400'}`}>{Math.round(gridCarbon)}g</span>
             </div>
         </div>
         <div className="hidden lg:block">
            <Controls />
         </div>
      </div>
      
      {/* Mobile controls */}
      <div className="mt-4 lg:hidden">
         <Controls />
      </div>
    </header>
  );
}

const DashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 overflow-x-hidden">
      <Header />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Grid: Visualizer & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Left: Energy Twin Visualizer */}
           <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Live Energy Flow
                 </h2>
                 <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-mono animate-pulse">SYSTEM ACTIVE</span>
              </div>
              <EnergyTwin />
           </div>

           {/* Right: Analytics */}
           <div className="lg:col-span-7 flex flex-col h-full">
               <h2 className="text-lg font-semibold mb-4 text-gray-300">Real-Time Analytics</h2>
               <div className="flex-1">
                 <DashboardCharts />
               </div>
           </div>
        </div>

        {/* Bottom: Logs & Scheduler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <AgentLog />
           <Scheduler />
        </div>

      </main>

      <ImageGenerator />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SimulationProvider>
      <DashboardContent />
    </SimulationProvider>
  );
};

export default App;
