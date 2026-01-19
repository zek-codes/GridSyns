import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState, LogEntry, ChartDataPoint, ScheduledTask } from '../types';
import { BATTERY_CAPACITY_KWH, MAX_SOLAR_OUTPUT_KWH, BASE_LOAD_KWH, MINUTES_PER_TICK } from '../constants';

const formatTime = (decimalTime: number) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.floor((decimalTime - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const INITIAL_STATE: SimulationState = {
  time: 6, // Start at 6 AM
  solarOutput: 0,
  load: BASE_LOAD_KWH,
  batterySoC: 50,
  gridPrice: 0.15,
  gridCarbon: 200,
  gridStatus: 'CONNECTED',
  netGridFlow: 0,
  batteryFlow: 0,
  moneySaved: 0,
  co2Saved: 0,
  cloudCover: 0.1,
  logs: [],
  hasBlackout: false,
  scheduledTasks: [],
};

interface SimulationContextType extends SimulationState {
  setCloudCover: (val: number) => void;
  toggleBlackout: () => void;
  addTask: (task: Omit<ScheduledTask, 'id' | 'status'>) => void;
  deleteTask: (id: string) => void;
  history: ChartDataPoint[];
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const historyRef = useRef<ChartDataPoint[]>([]); // Ref to avoid closure staleness in interval

  // Agent Logic
  const runAgent = useCallback((currentState: SimulationState): Partial<SimulationState> => {
    let { 
      solarOutput, load, batterySoC, gridPrice, gridCarbon, gridStatus, hasBlackout, scheduledTasks, time
    } = currentState;

    let batteryFlow = 0; // + Charge, - Discharge
    let netGridFlow = 0; // + Import, - Export
    let agentLog: LogEntry | null = null;
    let newGridStatus = gridStatus;
    let updatedTasks = [...scheduledTasks];

    // Check for Scheduled Tasks
    // Use epsilon for float comparison. Step is 0.25. If diff < 0.01, it's a match.
    const matchingTaskIndex = updatedTasks.findIndex(
        t => Math.abs(t.time - time) < 0.01 && t.status === 'PENDING'
    );
    const activeTask = matchingTaskIndex !== -1 ? updatedTasks[matchingTaskIndex] : null;

    if (activeTask) {
        // Mark as executed
        updatedTasks[matchingTaskIndex] = { ...activeTask, status: 'EXECUTED' };
        
        // Force Actions
        if (activeTask.action === 'FORCE_CHARGE') {
             batteryFlow = 5.0; // Max charge
             const netLoad = load - solarOutput + batteryFlow; // Total needed
             netGridFlow = netLoad; // Import all needed
             agentLog = { id: Date.now().toString(), timestamp: formatTime(time), message: "SCHEDULED TASK: Forcing Grid Charge.", type: 'warning' };
        } else if (activeTask.action === 'FORCE_DISCHARGE') {
             batteryFlow = -5.0; // Max discharge
             const netLoad = load - solarOutput + batteryFlow; // Net
             netGridFlow = netLoad; // Likely negative (export)
             agentLog = { id: Date.now().toString(), timestamp: formatTime(time), message: "SCHEDULED TASK: Forcing Battery Discharge.", type: 'warning' };
        }
    } else {
        // Standard Logic (Only if no task active)

        // 0. Update Grid Status based on Blackout Simulation
        if (hasBlackout) {
          newGridStatus = 'BLACKOUT';
        } else if (gridStatus === 'BLACKOUT' && !hasBlackout) {
          newGridStatus = 'CONNECTED';
        }

        // Logic C: Carbon Awareness (Island Mode)
        if (gridCarbon > 400 && batterySoC > 20 && !hasBlackout) {
           newGridStatus = 'ISLANDING';
           if (gridStatus !== 'ISLANDING') {
             agentLog = { id: Date.now().toString(), timestamp: formatTime(currentState.time), message: "High Carbon Intensity detected. Switching to ISLAND MODE.", type: 'warning' };
           }
        } else if (newGridStatus === 'ISLANDING' && gridCarbon <= 400 && !hasBlackout) {
           newGridStatus = 'CONNECTED';
           agentLog = { id: Date.now().toString(), timestamp: formatTime(currentState.time), message: "Carbon Intensity normalized. Reconnecting to Grid.", type: 'success' };
        }

        // Logic D: Blackout Handling
        if (newGridStatus === 'BLACKOUT') {
            const maxDischarge = (batterySoC / 100) * BATTERY_CAPACITY_KWH;
            const netNeeded = load - solarOutput;

            if (netNeeded > 0) {
               if (maxDischarge * 4 >= netNeeded) { 
                 batteryFlow = -netNeeded; 
               } else {
                 batteryFlow = 0; 
               }
            } else {
                batteryFlow = Math.abs(netNeeded); // Charge
            }
            netGridFlow = 0;
            if (!agentLog) agentLog = { id: Date.now().toString(), timestamp: formatTime(currentState.time), message: "GRID FAILURE. Running critical loads on Battery.", type: 'error' };
        } 
        else if (newGridStatus === 'ISLANDING') {
             const netNeeded = load - solarOutput;
             if (netNeeded > 0) {
                 batteryFlow = -netNeeded;
             } else {
                 batteryFlow = Math.abs(netNeeded);
             }
             netGridFlow = 0;
        }
        else {
            // CONNECTED MODE
            const netLoad = load - solarOutput;

            // Logic B: Arbitrage (Sell High)
            if (gridPrice > 0.40 && batterySoC > 80) {
                batteryFlow = -5.0; 
                netGridFlow = netLoad - batteryFlow; 
                if (!agentLog) agentLog = { id: Date.now().toString(), timestamp: formatTime(currentState.time), message: `Price Spike ($${gridPrice.toFixed(2)}). Arbitrage: Selling Battery power to Grid.`, type: 'success' };
            }
            // Logic A: Self-Consumption
            else if (netLoad < 0) {
                if (batterySoC < 100) {
                    batteryFlow = Math.abs(netLoad);
                    netGridFlow = 0;
                    if(Math.random() > 0.9) agentLog = { id: Date.now().toString(), timestamp: formatTime(currentState.time), message: "Solar Surplus. Charging Battery.", type: 'info' };
                } else {
                    batteryFlow = 0;
                    netGridFlow = netLoad; 
                }
            } else {
                if (batterySoC > 10) { 
                    batteryFlow = -netLoad;
                    netGridFlow = 0;
                    if(Math.random() > 0.9) agentLog = { id: Date.now().toString(), timestamp: formatTime(currentState.time), message: "Load exceeds Solar. Discharging Battery.", type: 'info' };
                } else {
                    batteryFlow = 0;
                    netGridFlow = netLoad; 
                }
            }
        }
    }

    // Apply Physics Constraints
    const energyChangeKWh = batteryFlow * (MINUTES_PER_TICK / 60);
    let newSoC = batterySoC + (energyChangeKWh / BATTERY_CAPACITY_KWH) * 100;
    
    if (newSoC > 100) {
        const excessKWh = ((newSoC - 100) / 100) * BATTERY_CAPACITY_KWH;
        const excessKW = excessKWh / (MINUTES_PER_TICK / 60);
        batteryFlow -= excessKW; 
        if (newGridStatus === 'CONNECTED') netGridFlow -= excessKW;
        newSoC = 100;
    }
    if (newSoC < 0) {
        const deficitKWh = (Math.abs(newSoC) / 100) * BATTERY_CAPACITY_KWH;
        const deficitKW = deficitKWh / (MINUTES_PER_TICK / 60);
        batteryFlow += deficitKW; 
        if (newGridStatus === 'CONNECTED') netGridFlow += deficitKW; 
        newSoC = 0;
    }

    const baselineCost = load * gridPrice * (MINUTES_PER_TICK / 60);
    const actualCost = netGridFlow * gridPrice * (MINUTES_PER_TICK / 60);
    const stepSavings = baselineCost - actualCost;

    const baselineCO2 = load * (gridCarbon / 1000) * (MINUTES_PER_TICK / 60); 
    const actualCO2 = (netGridFlow > 0 ? netGridFlow : 0) * (gridCarbon / 1000) * (MINUTES_PER_TICK / 60);
    const stepCO2 = baselineCO2 - actualCO2;

    const newLogs = agentLog ? [agentLog, ...currentState.logs].slice(0, 50) : currentState.logs;

    return {
        batterySoC: newSoC,
        netGridFlow,
        batteryFlow,
        moneySaved: currentState.moneySaved + stepSavings,
        co2Saved: currentState.co2Saved + stepCO2,
        gridStatus: newGridStatus,
        logs: newLogs,
        scheduledTasks: updatedTasks,
    };

  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        // 1. Advance Time
        let newTime = prev.time + (MINUTES_PER_TICK / 60);
        let taskReset = false;
        
        // Loop Day logic
        if (newTime >= 24) {
             newTime = 0;
             taskReset = true;
        }

        // 2. Generate Environment Data
        const sunHour = Math.PI * ((newTime - 6) / 12); 
        let rawSolar = newTime > 6 && newTime < 18 ? Math.sin(sunHour) * MAX_SOLAR_OUTPUT_KWH : 0;
        rawSolar = rawSolar * (1 - prev.cloudCover); 
        rawSolar = Math.max(0, rawSolar + (Math.random() * 0.2 - 0.1)); 

        let rawLoad = BASE_LOAD_KWH + (Math.random() * 0.2);
        if (newTime > 18 && newTime < 22) rawLoad += 3.5; 
        if (newTime > 7 && newTime < 9) rawLoad += 1.5; 

        let currentPrice = 0.15;
        if (newTime >= 17 && newTime < 21) currentPrice = 0.55;
        else if (newTime >= 9 && newTime < 17) currentPrice = 0.25;
        else currentPrice = 0.10;

        let currentCarbon = 500 - (rawSolar * 50); 
        currentCarbon = Math.max(100, Math.min(600, currentCarbon));

        // Reset tasks to PENDING if day looped
        const currentTasks = taskReset 
            ? prev.scheduledTasks.map(t => ({...t, status: 'PENDING' as const})) 
            : prev.scheduledTasks;

        const envState = {
            ...prev,
            time: newTime,
            solarOutput: rawSolar,
            load: rawLoad,
            gridPrice: currentPrice,
            gridCarbon: currentCarbon,
            scheduledTasks: currentTasks,
        };

        // 3. Run Agent
        const agentResult = runAgent(envState);

        const finalState = { ...envState, ...agentResult };
        
        const newDataPoint: ChartDataPoint = {
            time: formatTime(newTime),
            solar: finalState.solarOutput,
            load: finalState.load,
            battery: finalState.batterySoC,
            price: finalState.gridPrice * 100 
        };
        
        historyRef.current = [...historyRef.current.slice(-48), newDataPoint]; 
        setHistory(historyRef.current);

        return finalState;
      });
    }, 1000); 

    return () => clearInterval(timer);
  }, [runAgent]);

  const setCloudCover = (val: number) => setState(prev => ({ ...prev, cloudCover: val }));
  const toggleBlackout = () => setState(prev => ({ ...prev, hasBlackout: !prev.hasBlackout }));
  const addTask = (task: Omit<ScheduledTask, 'id' | 'status'>) => setState(prev => ({
      ...prev,
      scheduledTasks: [...prev.scheduledTasks, { ...task, id: Math.random().toString(36).substr(2, 9), status: 'PENDING' }]
  }));
  const deleteTask = (id: string) => setState(prev => ({
      ...prev,
      scheduledTasks: prev.scheduledTasks.filter(t => t.id !== id)
  }));

  return (
    <SimulationContext.Provider value={{ ...state, setCloudCover, toggleBlackout, history, addTask, deleteTask }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useEnergySimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useEnergySimulation must be used within SimulationProvider");
  return context;
};
