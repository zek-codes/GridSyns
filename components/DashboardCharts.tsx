import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useEnergySimulation } from '../hooks/useEnergySimulation';
import { DollarSign, Leaf } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-lg text-xs">
        <p className="text-gray-300 font-bold">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} {entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC = () => {
  const { history, moneySaved, co2Saved, gridPrice } = useEnergySimulation();

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-emerald-900/40 rounded-full">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
             <p className="text-gray-400 text-xs uppercase tracking-wider">Est. Savings</p>
             <p className="text-2xl font-mono font-bold text-white">${moneySaved.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-cyan-900/40 rounded-full">
            <Leaf className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
             <p className="text-gray-400 text-xs uppercase tracking-wider">CO2 Avoided</p>
             <p className="text-2xl font-mono font-bold text-white">{co2Saved.toFixed(2)} kg</p>
          </div>
        </div>
      </div>

      {/* Main Chart: The Duck Curve */}
      <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex-1 min-h-[250px] flex flex-col">
        <h3 className="text-gray-300 font-semibold mb-4 text-sm">Real-time Load & Solar (Duck Curve)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#6b7280" interval={12} />
            <YAxis tick={{fontSize: 10}} stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Area type="monotone" dataKey="solar" name="Solar" stroke="#34d399" fillOpacity={1} fill="url(#colorSolar)" unit="kW" />
            <Area type="monotone" dataKey="load" name="Load" stroke="#fbbf24" fillOpacity={1} fill="url(#colorLoad)" unit="kW" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
       {/* Secondary Chart: Price & Battery */}
       <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex-1 min-h-[200px] flex flex-col">
        <h3 className="text-gray-300 font-semibold mb-4 text-sm">Price vs Battery State</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#6b7280" interval={12} />
            <YAxis yAxisId="left" tick={{fontSize: 10}} stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} stroke="#6b7280" unit="¢" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="battery" name="SoC %" stroke="#22d3ee" strokeWidth={2} dot={false} unit="%" />
            <Line yAxisId="right" type="stepAfter" dataKey="price" name="Grid Price" stroke="#f43f5e" strokeWidth={2} dot={false} unit="¢" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
