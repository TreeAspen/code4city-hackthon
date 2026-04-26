import React, { useState } from 'react';
import { Incident311 } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { Map } from 'lucide-react';

interface AnalyticsSidebarProps {
  data: Incident311[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef4444', '#14b8a6', '#6366f1'];

export const AnalyticsSidebar = ({ data }: AnalyticsSidebarProps) => {
  const [viewType, setViewType] = useState<'total' | 'category'>('total');

  // Find all unique categories
  const categoriesSet = new Set<string>();
  data.forEach(d => categoriesSet.add(d.complaintType));
  const categories = Array.from(categoriesSet);

  // Aggregation for Bar Chart (Total By Borough)
  const boroughData = data.reduce((acc, curr) => {
    acc[curr.borough] = (acc[curr.borough] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartDataTotal = Object.keys(boroughData).map(key => ({
    name: key,
    count: boroughData[key]
  }));

  // Aggregation for Bar Chart (Category By Borough)
  const boroughCategoryData = data.reduce((acc, curr) => {
    if (!acc[curr.borough]) {
      acc[curr.borough] = { name: curr.borough };
    }
    // ensure unique keys by stripping spaces or keeping raw
    acc[curr.borough][curr.complaintType] = (acc[curr.borough][curr.complaintType] || 0) + 1;
    return acc;
  }, {} as Record<string, any>);
  const barChartDataCategory = Object.values(boroughCategoryData).map((d, index) => ({ ...d, _id: `${d.name}-${index}` }));

  // Aggregation for Trend Line Chart (Total By Date)
  const trendData = data.reduce((acc, curr) => {
    const date = curr.createdDate.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineChartDataTotal = Object.keys(trendData)
    .sort()
    .map(key => ({
      date: key,
      count: trendData[key]
    }));

  // Aggregation for Trend Line Chart (Category By Date)
  const trendCategoryData = data.reduce((acc, curr) => {
    const date = curr.createdDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = { date };
    }
    acc[date][curr.complaintType] = (acc[date][curr.complaintType] || 0) + 1;
    return acc;
  }, {} as Record<string, any>);
  
  const lineChartDataCategory = Object.keys(trendCategoryData)
    .sort()
    .map((key, index) => ({ ...trendCategoryData[key], _id: `${key}-${index}` }));

  // Aggregation by Category for Pie Chart
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
        {/* Density Map Placeholder */}
        <div>
          <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Spatial Density</h3>
          <div className="h-40 bg-white border border-gray-200 rounded-lg relative overflow-hidden flex flex-col items-center justify-center shadow-sm">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-100 to-slate-100" />
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-red-300 via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent" />
            
            <span className="relative z-10 font-bold text-slate-500 text-xs tracking-wide mt-2 flex items-center"><Map className="w-3.5 h-3.5 mr-1.5" /> HEATMAP PREVIEW</span>
            <span className="relative z-10 text-[9px] text-slate-400 mt-0.5">{data.length} records plotted</span>
          </div>
        </div>

        {/* Charts Section */}
        {viewType === 'total' ? (
          <>
            <div>
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Total by Borough</h3>
              <div className="h-40 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={barChartDataTotal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="count" fill="#FFE300" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Trend</h3>
              <div className="h-40 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={lineChartDataTotal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Category by Borough</h3>
              <div className="h-40 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={barChartDataCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="_id" tickFormatter={(v) => v.split('-')[0]} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(label) => typeof label === 'string' ? label.split('-')[0] : label} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f1f5f9'}} />
                    <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                    {categories.map((cat, idx) => (
                      <Bar key={`bar-cat-${cat}-${idx}`} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Trend by Category</h3>
              <div className="h-40 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={lineChartDataCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="_id" tickFormatter={(v) => v.split('-')[0]} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(label) => typeof label === 'string' ? label.split('-')[0] : label} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                    {categories.map((cat, idx) => (
                      <Line key={`line-cat-${cat}-${idx}`} type="monotone" dataKey={cat} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4">
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
                    <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend wrapperStyle={{fontSize: '10px'}} />
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