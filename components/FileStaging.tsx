
import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X, Loader2, Play, Files, Trash2, ArrowRight } from 'lucide-react';

interface FileStagingProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  hasExistingData: boolean;
  onJumpToAnalysis: () => void;
}

const FileStaging: React.FC<FileStagingProps> = ({ 
  files, 
  onFilesAdded, 
  onRemoveFile, 
  onConfirm,
  isProcessing,
  hasExistingData,
  onJumpToAnalysis
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) onFilesAdded(droppedFiles);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center text-center gap-3 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10' 
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 shadow-sm'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`p-4 rounded-xl transition-colors ${
          isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
        }`}>
          <Upload size={32} />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">Stage New Measurement Files</p>
          <p className="text-sm text-slate-500 mt-1">Select files to add to the analysis repository</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls, .csv"
          multiple
          onChange={(e) => {
            if (e.target.files) onFilesAdded(Array.from(e.target.files));
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Files size={16} /> Staging Area ({files.length})
          </span>
          {hasExistingData && (
             <button 
              onClick={onJumpToAnalysis}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
             >
               View Analysis <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <p className="text-sm">No files in staging area</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {files.map((file, idx) => (
                <li key={idx} className="px-5 py-3 flex items-center justify-between group hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded text-blue-600"><FileSpreadsheet size={16} /></div>
                    <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button onClick={() => onRemoveFile(idx)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <div className="p-5 bg-slate-50/30 border-t border-slate-100">
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                Confirm & Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileStaging;
