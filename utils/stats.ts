
import { DataRecord, StatsSummary } from '../types';

export const calculateStats = (data: DataRecord[]): StatsSummary => {
  const values = data.map(d => d.value);
  const count = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / count;
  const squareDiffs = values.map(v => Math.pow(v - mean, 2));
  const stdDev = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / count);
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const upperExceeded = data.filter(d => d.value > d.usl).length;
  const lowerExceeded = data.filter(d => d.value < d.lsl).length;
  const outOfSpecCount = upperExceeded + lowerExceeded;
  
  const yield_rate = ((count - outOfSpecCount) / count) * 100;
  
  // Basic CPK Calculation
  // We assume USL and LSL are constant from the first record for capability analysis
  const usl = data[0].usl;
  const lsl = data[0].lsl;
  
  const cpu = (usl - mean) / (3 * stdDev);
  const cpl = (mean - lsl) / (3 * stdDev);
  const cpk = Math.min(cpu, cpl);

  return {
    count,
    mean,
    stdDev,
    min,
    max,
    outOfSpecCount,
    upperExceeded,
    lowerExceeded,
    cpk: isNaN(cpk) ? 0 : cpk,
    yield: yield_rate
  };
};
