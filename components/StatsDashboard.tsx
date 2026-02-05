
import React from 'react';
import { StatsSummary } from '../types';
import { Target, Activity, Percent, AlertTriangle } from 'lucide-react';

interface StatsDashboardProps {
  stats: StatsSummary;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Average Value',
      value: stats.mean.toFixed(4),
      subValue: `Std Dev: ${stats.stdDev.toFixed(4)}`,
      icon: <Activity className="text-blue-600" size={20} />,
      color: 'bg-blue-50 border-blue-100'
    },
    {
      label: 'Process Yield',
      value: `${stats.yield.toFixed(2)}%`,
      subValue: `${stats.outOfSpecCount} out of ${stats.count} failed`,
      icon: <Percent className="text-green-600" size={20} />,
      color: 'bg-green-50 border-green-100'
    },
    {
      label: 'Process Capability (CPK)',
      value: stats.cpk.toFixed(3),
      subValue: stats.cpk >= 1.33 ? 'Excellent Process' : stats.cpk >= 1.0 ? 'Marginal Process' : 'Poor Process',
      icon: <Target className="text-purple-600" size={20} />,
      color: 'bg-purple-50 border-purple-100'
    },
    {
      label: 'Out of Spec',
      value: stats.outOfSpecCount.toString(),
      subValue: `↑${stats.upperExceeded} | ↓${stats.lowerExceeded}`,
      icon: <AlertTriangle className="text-amber-600" size={20} />,
      color: 'bg-amber-50 border-amber-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className={`p-5 rounded-2xl border ${card.color} shadow-sm transition-transform hover:scale-[1.02]`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">{card.label}</span>
            <div className="bg-white p-2 rounded-lg shadow-sm">
              {card.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{card.value}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">{card.subValue}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsDashboard;
