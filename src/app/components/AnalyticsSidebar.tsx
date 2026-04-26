import React, { useState } from 'react';
import { Incident311 } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { DensityMap } from './DensityMap';
import { BUCKET_LETTERS, BUCKET_TITLES, BUCKET_COLORS, TYPE_TO_BUCKET, BucketLetter } from '../buckets';

interface AnalyticsSidebarProps {
  data: Incident311[];
}

const monthKey = (iso: string) => iso.slice(0, 7); 
const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(m) - 1] ?? m} ${y.slice(2)}`;
};

const bucketOf = (complaintType: string): BucketLetter | null => TYPE_TO_BUCKET[complaintType] ?? null;

export const AnalyticsSidebar = ({ data }: AnalyticsSidebarProps) => {
  const [viewType, setViewType] = useState<'total' | 'category'>('category');
  
  // 新增：用于控制地图上的类别图层开关
  const [activeLayers, setActiveLayers] = useState<BucketLetter[]>(['A', 'B', 'C', 'D', 'E']);

  const toggleLayer = (letter: BucketLetter) => {
    setActiveLayers(prev => 
      prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
    );
  };

  const monthlyMap: Record<string, any> = {};
  data.forEach(d => {
    const k = monthKey(d.createdDate);
    if (!monthlyMap[k]) monthlyMap[k] = { key: k, month: monthLabel(k), total: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
    monthlyMap[k].total += 1; 
    const b = bucketOf(d.complaintType);
    if (b) monthlyMap[k][b] += 1;
  });
  const monthlyStacked = Object.keys(monthlyMap).sort().map(k => monthlyMap[k]);

  const bucketTotals: Record<BucketLetter, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  data.forEach(d => {
    const b = bucketOf(d.complaintType);
    if (b) bucketTotals[b] += 1;
  });
  const pieChartData = BUCKET_LETTERS
    .map(letter => ({ letter, name: BUCKET_TITLES[letter], value: bucketTotals[letter] }))
    .filter(d => d.value > 0);

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">
      <div className="p-3 border-b border-gray-200 shrink-0 bg-white">
        <h2 className="font-bold text-black text-xs uppercase tracking-tight">Analytics</h2>
        <div className="flex mt-2 bg-gray-100 p-0.5 rounded-sm border border-gray-200">
          <button
            className={`flex-1 text-[10px] py-1 px-2 font-bold rounded-sm uppercase tracking-tight transition-colors ${viewType === 'total' ? 'bg-black text-[#FFE300] shadow-sm' : 'text-gray-600 hover:bg-gray-200 hover:text-black'}`}
            onClick={() => setViewType('total')}
          >
            Total
          </button>
          <button
            className={`flex-1 text-[10px] py-1 px-2 font-bold rounded-sm uppercase tracking-tight transition-colors ${viewType === 'category' ? 'bg-black text-[#FFE300] shadow-sm' : 'text-gray-600 hover:bg-gray-200 hover:text-black'}`}
            onClick={() => setViewType('category')}
          >
            Category
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gray-50">
        
        {/* Map Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5 border-b border-gray-200 pb-1">
            <h3 className="text-[10px] font-bold text-black uppercase tracking-tight">
              {viewType === 'total' ? 'Density Map' : 'Category Distribution Map'}
            </h3>
          </div>
          
          <div className="h-64 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
            <DensityMap data={data} viewType={viewType} activeCategories={activeLayers} />
          </div>

          {/* 图层多选控制面板 (仅在 Category 模式下显示) */}
          {viewType === 'category' && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {BUCKET_LETTERS.map(letter => {
                const isActive = activeLayers.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => toggleLayer(letter)}
                    className="flex items-center gap-1 px-1.5 py-0.5 border rounded-sm text-[9px] font-bold transition-all"
                    style={{
                      borderColor: isActive ? BUCKET_COLORS[letter] : '#e5e7eb',
                      backgroundColor: isActive ? `${BUCKET_COLORS[letter]}15` : '#ffffff',
                      color: isActive ? '#000' : '#9ca3af',
                      opacity: isActive ? 1 : 0.6
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BUCKET_COLORS[letter] }} />
                    {letter}
                  </button>
                );
              })}
            </div>
          )}
          
          <p className="mt-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-tight text-right">
            {data.length} records mapped
          </p>
        </div>

        {/* Monthly Trend Section */}
        <div>
          <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">
            {viewType === 'total' ? 'Monthly Trend (Total)' : 'Monthly Trend by Category (A–E)'}
          </h3>
          <div className="h-52 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStacked} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} cursor={{ fill: '#f8fafc' }} />
                
                {viewType === 'category' ? (
                  <>
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '6px' }} />
                    {BUCKET_LETTERS.map(letter => (
                      <Bar key={letter} dataKey={letter} name={letter} stackId="bucket" fill={BUCKET_COLORS[letter]} stroke="#000" strokeWidth={0.5} />
                    ))}
                  </>
                ) : (
                  <Bar dataKey="total" name="Total Records" fill="#1f2937" radius={[2, 2, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Section */}
        {viewType === 'category' && (
          <div>
            <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Distribution</h3>
            <div className="h-56 bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="45%" innerRadius={42} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="letter">
                    {pieChartData.map(entry => <Cell key={entry.letter} fill={BUCKET_COLORS[entry.letter]} stroke="#000" strokeWidth={0.5} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};