
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ComposedChart, Area, Scatter, BarChart, Bar, ReferenceArea, Cell
} from 'recharts';
import { DataRecord } from '../types';

interface ChartViewProps {
  data: DataRecord[];
}

const ChartView: React.FC<ChartViewProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const usl = data[0]?.usl;
  const lsl = data[0]?.lsl;
  const target = (usl + lsl) / 2;

  // Calculate Histogram Bins
  const histogramData = useMemo(() => {
    if (data.length < 5) return [];
    const values = data.map(d => d.value);
    const min = Math.min(...values, lsl - (usl - lsl) * 0.1);
    const max = Math.max(...values, usl + (usl - lsl) * 0.1);
    const binCount = 15;
    const step = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      binStart: min + i * step,
      binEnd: min + (i + 1) * step,
      count: 0,
      label: (min + i * step + step / 2).toFixed(3)
    }));

    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / step), binCount - 1);
      if (binIndex >= 0) bins[binIndex].count++;
    });

    return bins;
  }, [data, usl, lsl]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-xl ring-1 ring-black/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {item.serialNumber ? `SN: ${item.serialNumber}` : `Value: ${item.label || item.value}`}
          </p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.isOutOfSpec ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
            <span className="text-sm font-bold text-slate-900">
              {item.value ? item.value.toFixed(4) : item.count}
            </span>
          </div>
          {item.usl !== undefined && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex gap-3 text-[9px] font-medium text-slate-400">
              <span>LSL: {item.lsl}</span>
              <span>USL: {item.usl}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* SVG Filters for "Glow" effects */}
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </svg>

      {/* Main Trend Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Unified Trend Analysis</h3>
            <p className="text-xs text-slate-500">Run chart with specification boundary shading</p>
          </div>
          <div className="flex flex-wrap gap-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" /> SAFE ZONE
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <div className="w-3 h-3 rounded bg-red-500" /> OUT OF SPEC
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="index" 
                fontSize={10} 
                stroke="#cbd5e1" 
                tick={{fill: '#94a3b8'}}
                tickFormatter={(val) => `#${val + 1}`}
              />
              <YAxis 
                fontSize={10} 
                stroke="#cbd5e1" 
                domain={['auto', 'auto']}
                tick={{fill: '#94a3b8'}}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Highlight Safe Zone */}
              <ReferenceArea y1={lsl} y2={usl} fill="#22c55e" fillOpacity={0.03} />
              
              <ReferenceLine y={usl} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'USL', position: 'right', fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine y={lsl} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'LSL', position: 'right', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine y={target} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" label={{ value: 'TARGET', position: 'insideLeft', fill: '#94a3b8', fontSize: 9 }} />
              
              <Area type="monotone" dataKey="value" stroke="none" fill="url(#lineGradient)" />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isOutOfSpec) {
                    return (
                      <g filter="url(#glow)">
                        <circle cx={cx} cy={cy} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
                      </g>
                    );
                  }
                  return <circle cx={cx} cy={cy} r={3} fill="#fff" stroke="#2563eb" strokeWidth={2} />;
                }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Capability Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Process Distribution
            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">Histogram</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="label" fontSize={9} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={9} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
                          <p className="opacity-60 mb-1">Range Center: {payload[0].payload.label}</p>
                          <p className="font-bold">Frequency: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {histogramData.map((entry, index) => {
                    const center = parseFloat(entry.label);
                    const isOutside = center > usl || center < lsl;
                    return <Cell key={`cell-${index}`} fill={isOutside ? '#f43f5e' : '#3b82f6'} fillOpacity={0.8} />;
                  })}
                </Bar>
                <ReferenceLine x={usl.toString()} stroke="#f43f5e" strokeDasharray="3 3" />
                <ReferenceLine x={lsl.toString()} stroke="#10b981" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Histogram bins showing data density relative to USL/LSL. Skewness indicates process offset.
          </p>
        </div>

        {/* Variation Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Recent Variance
            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">Last 20 Samples</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(-20)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="serialNumber" hide />
                <YAxis domain={['auto', 'auto']} fontSize={9} tick={{fill: '#94a3b8'}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={20}>
                  {data.slice(-20).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isOutOfSpec ? '#f43f5e' : '#60a5fa'} 
                      fillOpacity={entry.isOutOfSpec ? 1 : 0.7}
                    />
                  ))}
                </Bar>
                <ReferenceLine y={target} stroke="#cbd5e1" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Detailed view of the last 20 measurement entries. Red bars indicate non-conformance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
