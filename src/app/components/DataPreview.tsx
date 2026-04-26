import React, { useState } from 'react';
import { Incident311 } from '../types';
import { ChevronRight, ArrowUpDown, Filter, Download } from 'lucide-react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';

interface DataPreviewProps {
  data: Incident311[];
}

export const DataPreview = ({ data }: DataPreviewProps) => {
  const [sortField, setSortField] = useState<keyof Incident311>('createdDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Incident311) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const headers = [
    { key: 'id', label: 'Incident ID' },
    { key: 'createdDate', label: 'Date' },
    { key: 'complaintType', label: 'Complaint Type' },
    { key: 'descriptor', label: 'Descriptor' },
    { key: 'borough', label: 'Borough' },
    { key: 'communityBoard', label: 'Community Board' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="bg-white border border-gray-200 h-full flex flex-col shadow-sm rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center bg-[#FFE300]">
        <div className="flex items-center space-x-1.5">
          <Filter className="w-4 h-4 text-black" />
          <h3 className="font-bold text-black text-xs uppercase tracking-tight">Data Preview</h3>
          <span className="bg-black text-[#FFE300] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">{data.length} records</span>
        </div>
        <button className="text-[10px] flex items-center space-x-1 text-black hover:bg-black hover:text-[#FFE300] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight transition-colors border border-transparent hover:border-black">
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-sm text-black">
          <thead className="text-xs uppercase bg-gray-50 sticky top-0 z-10 border-b border-gray-200 font-bold">
            <tr>
              {headers.map(({ key, label }) => (
                <th key={key} className="px-4 py-3 font-bold text-black whitespace-nowrap border-r border-gray-200 last:border-r-0">
                  <button 
                    className="flex items-center space-x-1 hover:text-gray-600 transition-colors uppercase tracking-tight group"
                    onClick={() => handleSort(key as keyof Incident311)}
                  >
                    <span>{label}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.length > 0 ? (
              sortedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-2.5 font-bold text-black border-r border-gray-200">{row.id}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap border-r border-gray-200 font-medium">{row.createdDate}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200"><span className="bg-black text-[#FFE300] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-tight">{row.complaintType}</span></td>
                  <td className="px-4 py-2.5 font-bold border-r border-gray-200">{row.descriptor}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 font-medium">{row.borough}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 font-medium">{row.communityBoard}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border border-gray-300 uppercase tracking-tight ${
                      row.status === 'Closed' ? 'bg-green-100 text-green-800' : 
                      row.status === 'Open' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-600">No matching records found.</p>
                    <p className="text-xs text-gray-400 mt-1">Try relaxing your map, time, or AI category filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs font-bold text-black flex justify-between items-center">
        <span className="uppercase tracking-tight text-gray-600">Showing {sortedData.length} of {sortedData.length} filtered results</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-1.5 bg-black hover:bg-gray-800 text-[#FFE300] px-4 py-2 rounded-md font-bold uppercase tracking-tight transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 font-medium">
            <DropdownMenuItem className="cursor-pointer font-bold uppercase tracking-tight">Export as CSV</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer font-bold uppercase tracking-tight">Export as Excel</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer font-bold uppercase tracking-tight">Export as Shapefile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer font-bold uppercase tracking-tight">Export as GeoJSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
