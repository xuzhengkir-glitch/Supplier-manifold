
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { DataRecord, StatsSummary } from '../types';
import { BrainCircuit, Loader2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface GeminiAnalysisProps {
  data: DataRecord[];
  stats: StatsSummary;
}

const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ data, stats }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const summaryText = `
        Analyze this manufacturing measurement data summary:
        Total Samples: ${stats.count}
        Mean: ${stats.mean.toFixed(4)}
        Standard Deviation: ${stats.stdDev.toFixed(4)}
        Min/Max: ${stats.min.toFixed(4)} / ${stats.max.toFixed(4)}
        Out of Spec: ${stats.outOfSpecCount} (${stats.yield.toFixed(2)}% yield)
        CPK: ${stats.cpk.toFixed(3)}
        Specifications: LSL ${data[0].lsl}, USL ${data[0].usl}
        
        Provide a professional quality engineering assessment. 
        Focus on:
        1. Process Stability: Does the data look centered?
        2. Capability Analysis: Is the CPK healthy (target > 1.33)?
        3. Root Cause Suggestions: If failures exist, suggest possible mechanical or process reasons.
        4. Recommendations: Practical steps to improve precision or accuracy.
        
        Keep the response concise, formatted with clear headings, and helpful for a production manager.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: summaryText,
      });

      setAnalysis(response.text || "No analysis generated.");
    } catch (err) {
      console.error(err);
      setError("AI analysis failed to load. Please ensure your environment is configured correctly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!analysis && !loading) {
      performAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-purple-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Gemini Process Intelligence</h3>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Refresh Insights
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <p className="text-sm font-medium animate-pulse">Consulting Gemini for quality insights...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
             <AlertCircle size={40} className="text-red-400" />
             <div className="text-center">
               <p className="font-semibold text-slate-600">Analysis Unavailable</p>
               <p className="text-xs max-w-xs">{error}</p>
             </div>
          </div>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none">
            {analysis?.split('\n').map((line, i) => {
              if (line.startsWith('#')) {
                return <h4 key={i} className="text-purple-900 font-bold mt-4 mb-2 first:mt-0">{line.replace(/^#+\s*/, '')}</h4>;
              }
              if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                return <li key={i} className="text-slate-600 ml-4 mb-1">{line.trim().substring(1).trim()}</li>;
              }
              return line.trim() ? <p key={i} className="text-slate-600 leading-relaxed mb-3">{line}</p> : <br key={i} />;
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        <MessageSquare size={12} />
        Powered by Google Gemini 3 Flash
      </div>
    </div>
  );
};

export default GeminiAnalysis;
