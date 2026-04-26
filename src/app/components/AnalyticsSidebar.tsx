import React, { useState } from 'react';
import { Incident311, FilterState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { MapSelector } from './MapSelector';

interface AnalyticsSidebarProps {
  data: Incident311[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef4444', '#14b8a6', '#6366f1'];

export const AnalyticsSidebar = ({ data, filters, setFilters }: AnalyticsSidebarProps) => {
  const [viewType, setViewType] = useState<'total' | 'category'>('total');
  const [mapLevel, setMapLevel] = useState<'borough' | 'district'>('borough');

  const toggleBorough = (name: string) => {
    setFilters(prev => {
      const exists = prev.boroughs.includes(name);
      return {
        ...prev,
        // selecting a borough clears district selection (mutually exclusive)
        communityBoards: [],
        boroughs: exists ? prev.boroughs.filter(b => b !== name) : [...prev.boroughs, name],
      };
    });
  };

  const toggleDistrict = (code: string) => {
    setFilters(prev => {
      const exists = prev.communityBoards.includes(code);
      return {
        ...prev,
        boroughs: [],
        communityBoards: exists ? prev.communityBoards.filter(c => c !== code) : [...prev.communityBoards, code],
      };
    });
  };

  const clearSpatial = () => {
    setFilters(prev => ({ ...prev, boroughs: [], communityBoards: [] }));
  };

  const categoriesSet = new Set<string>();
  data.forEach(d => categoriesSet.add(d.complaintType));
  const categories = Array.from(categoriesSet);

  const boroughData = data.reduce((acc, curr) => {
    acc[curr.borough] = (acc[curr.borough] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartDataTotal = Object.keys(boroughData).map(key => ({
    name: key,
    count: boroughData[key]
  }));

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

  const categoryData = data.reduce((acc, curr) => {
    acc[curr.complaintType] = (acc[curr.complaintType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(categoryData).map((key) => ({
    name: key,
    value: categoryData[key]
  }));

  const hasSpatial = filters.boroughs.length + filters.communityBoards.length > 0;

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
        {/* Interactive Map */}
        <div>
          <div className="flex items-center justify-between mb-1.5 border-b border-gray-200 pb-1">
            <h3 className="text-[10px] font-bold text-black uppercase tracking-tight">Spatial Filter</h3>
            <div className="flex items-center gap-1">
              <div className="flex bg-gray-100 p-0.5 rounded-sm border border-gray-200">
                <button
                  className={`text-[9px] px-1.5 py-0.5 font-bold rounded-sm uppercase ${mapLevel === 'borough' ? 'bg-black text-[#FFE300]' : 'text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setMapLevel('borough')}
                >
                  Borough
                </button>
                <button
                  className={`text-[9px] px-1.5 py-0.5 font-bold rounded-sm uppercase ${mapLevel === 'district' ? 'bg-black text-[#FFE300]' : 'text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setMapLevel('district')}
                >
                  District
                </button>
              </div>
              {hasSpatial && (
                <button
                  className="text-[9px] px-1.5 py-0.5 font-bold uppercase text-gray-600 hover:text-black border border-gray-300 rounded-sm bg-white"
                  onClick={clearSpatial}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="h-64 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <MapSelector
              level={mapLevel}
              selectedBoroughs={filters.boroughs}
              selectedDistricts={filters.communityBoards}
              onToggleBorough={toggleBorough}
              onToggleDistrict={toggleDistrict}
            />
          </div>
          {hasSpatial && (
            <p className="mt-1.5 text-[9px] text-gray-600 font-bold uppercase tracking-tight">
              Selected: {[...filters.boroughs, ...filters.communityBoards].join(', ')} · {data.length} records
            </p>
          )}
        </div>

        {viewType === 'total' ? (
          <>
            <div>
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Total by Borough</h3>
              <div className="h-40 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={barChartDataTotal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9' }} />
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
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4">
              <h3 className="text-[10px] font-bold text-black uppercase tracking-tight mb-1.5 border-b border-gray-200 pb-1">Trend by Category</h3>
              <div className="h-40 relative bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={lineChartDataCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="_id" tickFormatter={(v) => v.split('-')[0]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(label) => typeof label === 'string' ? label.split('-')[0] : label} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
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
