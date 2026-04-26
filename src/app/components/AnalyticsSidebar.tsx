import React, { useState } from 'react';
import { Incident311 } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { DensityMap } from './DensityMap';

interface AnalyticsSidebarProps {
  data: Incident311[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef4444', '#14b8a6', '#6366f1'];

const monthKey = (iso: string) => iso.slice(0, 7); // YYYY-MM
const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(m) - 1] ?? m} ${y.slice(2)}`;
};

export const AnalyticsSidebar = ({ data }: AnalyticsSidebarProps) => {
  const [viewType, setViewType] = useState<'total' | 'category'>('total');

  const categoriesSet = new Set<string>();
  data.forEach(d => categoriesSet.add(d.complaintType));
  const categories = Array.from(categoriesSet);

  // Monthly trend (total)
  const monthlyTotalMap = data.reduce((acc, curr) => {
    const k = monthKey(curr.createdDate);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyTotal = Object.keys(monthlyTotalMap)
    .sort()
    .map(key => ({ month: monthLabel(key), key, count: monthlyTotalMap[key] }));

  // Monthly trend (per category)
  const monthlyCatMap = data.reduce((acc, curr) => {
    const k = monthKey(curr.createdDate);
    if (!acc[k]) acc[k] = { key: k, month: monthLabel(k) };
    acc[k][curr.complaintType] = (acc[k][curr.complaintType] || 0) + 1;
    return acc;
  }, {} as Record<string, any>);

  const monthlyCategory = Object.keys(monthlyCatMap)
    .sort()
    .map(k => monthlyCatMap[k]);

  const categoryData = data.reduce((acc, curr) => {
    acc[curr.complaintType] = (acc[curr.complaintType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(categoryData).map((key) => ({
    name: key,
    value: categoryData[key]
  }));

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
        {/* Density Map */}
        <div>
          <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Density Map</h3>
          <div className="h-56 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <DensityMap data={data} />
          </div>
          <p className="mt-1 text-[9px] text-gray-500 font-bold uppercase tracking-tight">{data.length} records · color = count by borough</p>
        </div>

        {viewType === 'total' ? (
          <div>
            <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Monthly Trend</h3>
            <div className="h-48 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={monthlyTotal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#FFE300" stroke="#000" strokeWidth={1} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Monthly Trend by Category</h3>
              <div className="h-48 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={monthlyCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    {categories.map((cat, idx) => (
                      <Line key={`line-cat-${cat}-${idx}`} type="monotone" dataKey={cat} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Distribution</h3>
              <div className="h-48 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
