
import React, { useState, useCallback, useMemo } from 'react';
import { BarChart3, Database, BrainCircuit, Trash2, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Files, HardDrive } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DataRecord, StatsSummary } from './types';
import FileStaging from './components/FileStaging';
import FileRepository from './components/FileRepository';
import StatsDashboard from './components/StatsDashboard';
import ChartView from './components/ChartView';
import DataTable from './components/DataTable';
import GeminiAnalysis from './components/GeminiAnalysis';
import { calculateStats } from './utils/stats';

interface UploadedFileEntry {
  id: string;
  name: string;
  size: number;
  data: DataRecord[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visualize' | 'data' | 'ai' | 'files'>('visualize');
  const [error, setError] = useState<string | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileEntry[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Flattened data for stats and charts
  const allData = useMemo(() => {
    return uploadedFiles.flatMap(f => f.data).map((record, idx) => ({
      ...record,
      index: idx // re-index for the unified view
    }));
  }, [uploadedFiles]);

  const stats = useMemo(() => {
    return allData.length > 0 ? calculateStats(allData) : null;
  }, [allData]);

  const handleFilesStaged = useCallback((files: File[]) => {
    setError(null);
    setStagedFiles(prev => [...prev, ...files]);
  }, []);

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (uploadedFiles.length <= 1) {
      setIsAnalysing(false);
    }
  };

  const processStagedFiles = async () => {
    if (stagedFiles.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    const newEntries: UploadedFileEntry[] = [];

    try {
      for (const file of stagedFiles) {
        const dataBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(dataBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawJson.length > 0) {
          const fileData: DataRecord[] = rawJson.map((row, idx) => {
            const value = parseFloat(row['测量值'] || row['Value'] || row['value'] || 0);
            const usl = parseFloat(row['上限'] || row['USL'] || row['upper'] || 0);
            const lsl = parseFloat(row['下限'] || row['LSL'] || row['lower'] || 0);
            const serial = row['序列号'] || row['Serial'] || row['SN'] || row['No.'] || `${file.name}-${idx + 1}`;

            return {
              index: 0, // Placeholder, calculated on merge
              serialNumber: serial,
              value,
              usl,
              lsl,
              isOutOfSpec: value > usl || value < lsl
            };
          });

          newEntries.push({
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            size: file.size,
            data: fileData
          });
        }
      }

      setUploadedFiles(prev => [...prev, ...newEntries]);
      setStagedFiles([]);
      setIsAnalysing(true);
      setActiveTab('visualize');
    } catch (err) {
      console.error(err);
      setError("Failed to process staged files. Check file formats.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSystem = () => {
    setUploadedFiles([]);
    setStagedFiles([]);
    setError(null);
    setIsAnalysing(false);
    setActiveTab('visualize');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Measurement Insights Pro
            </h1>
          </div>
          
          {(uploadedFiles.length > 0 || stagedFiles.length > 0) && (
            <div className="flex items-center gap-3">
              <button 
                onClick={clearSystem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
                Clear System
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {!isAnalysing ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">File Management</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                Stage new inspection records below. Once confirmed, they will be processed into the master dataset.
              </p>
            </div>

            <FileStaging 
              files={stagedFiles}
              onFilesAdded={handleFilesStaged}
              onRemoveFile={removeStagedFile}
              onConfirm={processStagedFiles}
              isProcessing={isProcessing}
              hasExistingData={uploadedFiles.length > 0}
              onJumpToAnalysis={() => setIsAnalysing(true)}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div><p className="text-sm font-medium">{error}</p></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsAnalysing(false)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-2"
                  title="Return to Upload"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-semibold">Back to Upload</span>
                </button>
                <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Process Dashboard</h2>
                  <p className="text-xs text-slate-500">Monitoring {uploadedFiles.length} files ({allData.length} records)</p>
                </div>
              </div>
            </div>

            {stats && <StatsDashboard stats={stats} />}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'visualize', icon: <BarChart3 size={18} />, label: 'Visualizations' },
                  { id: 'data', icon: <Database size={18} />, label: 'Unified Data' },
                  { id: 'ai', icon: <BrainCircuit size={18} />, label: 'AI Diagnostic' },
                  { id: 'files', icon: <HardDrive size={18} />, label: 'Repository' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative shrink-0 ${
                      activeTab === tab.id 
                        ? 'text-blue-600' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'visualize' && <ChartView data={allData} />}
                {activeTab === 'data' && <DataTable data={allData} />}
                {activeTab === 'ai' && <GeminiAnalysis data={allData} stats={stats!} />}
                {activeTab === 'files' && (
                  <FileRepository 
                    files={uploadedFiles} 
                    onDelete={removeUploadedFile} 
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-center">
        <p className="text-sm text-slate-400">Built with React & Gemini AI for Process Quality</p>
      </footer>
    </div>
  );
};

export default App;
