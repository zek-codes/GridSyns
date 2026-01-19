import React, { useState } from 'react';
import { useEnergySimulation } from '../hooks/useEnergySimulation';
import { CalendarClock, Plus, Trash2, BatteryCharging, BatteryWarning, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';

export const Scheduler: React.FC = () => {
  const { scheduledTasks, addTask, deleteTask } = useEnergySimulation();
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [action, setAction] = useState<'FORCE_CHARGE' | 'FORCE_DISCHARGE'>('FORCE_CHARGE');

  const handleAdd = () => {
    const time = hour + (minute / 60);
    addTask({ time, action });
  };

  const formatDecimalTime = (t: number) => {
    const h = Math.floor(t);
    const m = Math.floor((t - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-64">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-gray-400">TASK_SCHEDULER</span>
         </div>
      </div>
      
      <div className="p-4 flex flex-col h-full gap-4">
        {/* Input Row */}
        <div className="flex items-center gap-2">
           <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 p-1">
             <select 
               value={hour} 
               onChange={(e) => setHour(parseInt(e.target.value))}
               className="bg-transparent text-white text-sm focus:outline-none text-center w-12 appearance-none"
             >
               {Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>)}
             </select>
             <span className="text-gray-500">:</span>
             <select 
               value={minute} 
               onChange={(e) => setMinute(parseInt(e.target.value))}
               className="bg-transparent text-white text-sm focus:outline-none text-center w-12 appearance-none"
             >
               {[0, 15, 30, 45].map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
             </select>
           </div>
           
           <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
              <button 
                onClick={() => setAction('FORCE_CHARGE')}
                className={clsx("p-1.5 rounded transition-colors", action === 'FORCE_CHARGE' ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white")}
                title="Force Charge"
              >
                 <BatteryCharging className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setAction('FORCE_DISCHARGE')}
                className={clsx("p-1.5 rounded transition-colors", action === 'FORCE_DISCHARGE' ? "bg-rose-600 text-white" : "text-gray-400 hover:text-white")}
                title="Force Discharge"
              >
                 <BatteryWarning className="w-4 h-4" />
              </button>
           </div>

           <button 
              onClick={handleAdd}
              className="ml-auto bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
           >
              <Plus className="w-4 h-4" />
              ADD
           </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
            {scheduledTasks.length === 0 && <div className="text-gray-600 text-xs italic text-center mt-4">No tasks scheduled.</div>}
            
            {scheduledTasks.sort((a,b) => a.time - b.time).map(task => (
                <div 
                    key={task.id} 
                    className={clsx(
                        "p-2 rounded flex items-center justify-between group border transition-all",
                        task.status === 'EXECUTED' 
                            ? "bg-gray-800/30 border-gray-700/30 opacity-60" 
                            : "bg-gray-800/50 border-gray-700/50 hover:border-purple-500/30"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={clsx("p-1.5 rounded-full", task.status === 'EXECUTED' ? "bg-green-500/10 text-green-500" : "bg-gray-700/50 text-gray-400")}>
                             {task.status === 'EXECUTED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={clsx("font-mono text-sm font-bold", task.status === 'EXECUTED' ? "text-gray-500" : "text-gray-200")}>
                                    {formatDecimalTime(task.time)}
                                </span>
                                <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-full font-bold", 
                                    task.status === 'PENDING' ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400")}>
                                    {task.status}
                                </span>
                            </div>
                            
                            <span className={clsx(
                                "text-xs font-bold flex items-center gap-1", 
                                task.action === 'FORCE_CHARGE' 
                                    ? (task.status === 'EXECUTED' ? "text-emerald-700" : "text-emerald-400") 
                                    : (task.status === 'EXECUTED' ? "text-rose-700" : "text-rose-400")
                            )}>
                                {task.action === 'FORCE_CHARGE' ? <BatteryCharging className="w-3 h-3" /> : <BatteryWarning className="w-3 h-3" />}
                                {task.action === 'FORCE_CHARGE' ? "FORCE CHARGE" : "FORCE DISCHARGE"}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
