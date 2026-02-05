
import React, { useState } from 'react';
import { DataRecord } from '../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface DataTableProps {
  data: DataRecord[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof DataRecord>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredData = data.filter(d => 
    d.serialNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === undefined || valB === undefined) return 0;
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: keyof DataRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search Serial Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredData.length}</span> of {data.length} records
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('index')}>
                <div className="flex items-center gap-1">No. <ArrowUpDown size={12} /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('serialNumber')}>
                <div className="flex items-center gap-1">Serial Number <ArrowUpDown size={12} /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('value')}>
                <div className="flex items-center gap-1">Measurement <ArrowUpDown size={12} /></div>
              </th>
              <th className="px-6 py-4">LSL</th>
              <th className="px-6 py-4">USL</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredData.map((row) => (
              <tr key={row.index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono">{row.index + 1}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{row.serialNumber}</td>
                <td className="px-6 py-4 text-slate-700">{row.value.toFixed(4)}</td>
                <td className="px-6 py-4 text-slate-400 font-mono">{row.lsl}</td>
                <td className="px-6 py-4 text-slate-400 font-mono">{row.usl}</td>
                <td className="px-6 py-4">
                  {row.isOutOfSpec ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Fail
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Pass
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
