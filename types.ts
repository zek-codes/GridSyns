export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ScheduledTask {
  id: string;
  time: number; // 0.0 to 24.0
  action: 'FORCE_CHARGE' | 'FORCE_DISCHARGE';
  status: 'PENDING' | 'EXECUTED';
}

export interface SimulationState {
  time: number; // 0 to 24 (representing hours)
  solarOutput: number; // kW
  load: number; // kW
  batterySoC: number; // % (0-100)
  gridPrice: number; // $/kWh
  gridCarbon: number; // gCO2/kWh
  gridStatus: 'CONNECTED' | 'ISLANDING' | 'BLACKOUT';
  netGridFlow: number; // kW (+ is Import, - is Export)
  batteryFlow: number; // kW (+ is Charging, - is Discharging)
  moneySaved: number; // $
  co2Saved: number; // kg
  cloudCover: number; // 0-1 (0% to 100%)
  logs: LogEntry[];
  hasBlackout: boolean;
  scheduledTasks: ScheduledTask[];
}

export interface AgentDecision {
  action: 'CHARGE' | 'DISCHARGE' | 'IDLE';
  source?: 'GRID' | 'SOLAR';
  destination?: 'GRID' | 'LOAD' | 'BATTERY';
  reason: string;
}

export interface ChartDataPoint {
  time: string;
  solar: number;
  load: number;
  battery: number;
  price: number;
}
