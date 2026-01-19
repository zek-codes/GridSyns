import React from 'react';
import { useEnergySimulation } from '../hooks/useEnergySimulation';
import { CloudRain, CloudSun, Power, Sun } from 'lucide-react';
import clsx from 'clsx';

export const Controls: React.FC = () => {
  const { cloudCover, setCloudCover, toggleBlackout, hasBlackout } = useEnergySimulation();

  return (
    <div className="flex items-center gap-6 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-gray-700/50">
        
        {/* Cloud Slider */}
        <div className="flex items-center gap-3 px-4">
            <Sun className="w-4 h-4 text-emerald-400" />
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={cloudCover}
                onChange={(e) => setCloudCover(parseFloat(e.target.value))}
                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <CloudRain className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-mono w-12 text-right">{(cloudCover * 100).toFixed(0)}% Cover</span>
        </div>

        <div className="w-px h-8 bg-gray-700 mx-2" />

        {/* Blackout Button */}
        <button 
            onClick={toggleBlackout}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                hasBlackout 
                    ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
        >
            <Power className="w-4 h-4" />
            {hasBlackout ? "RESTORE GRID" : "SIMULATE BLACKOUT"}
        </button>

    </div>
  );
};
