
export interface DataRecord {
  index: number;
  serialNumber?: string | number;
  value: number;
  usl: number;
  lsl: number;
  isOutOfSpec: boolean;
}

export interface StatsSummary {
  count: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  outOfSpecCount: number;
  upperExceeded: number;
  lowerExceeded: number;
  cpk: number;
  yield: number;
}

export interface AnalysisInsight {
  title: string;
  type: 'success' | 'warning' | 'error' | 'info';
  content: string;
}
