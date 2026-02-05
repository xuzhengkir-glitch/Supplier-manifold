
import React from 'react';
import { FileSpreadsheet, Trash2, HardDrive, Database } from 'lucide-react';

interface FileRepositoryProps {
  files: { id: string; name: string; size: number; data: any[] }[];
  onDelete: (id: string) => void;
}

const FileRepository: React.FC<FileRepositoryProps> = ({ files, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Master Data Repository</h3>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {files.length} Files Total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => (
          <div key={file.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="bg-blue-600 p-3 rounded-xl text-white shadow-sm">
                <FileSpreadsheet size={20} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-900 truncate" title={file.name}>
                  {file.name}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                  <span className="flex items-center gap-1"><Database size={10} /> {file.data.length} records</span>
                  <span>•</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onDelete(file.id)}
              className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Delete from Repository"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {files.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium">Repository is empty. Go back to upload files.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">System Note:</span> Deleting a file from the repository will immediately remove its data points from the unified trend analysis and statistical reports.
        </p>
      </div>
    </div>
  );
};

export default FileRepository;
