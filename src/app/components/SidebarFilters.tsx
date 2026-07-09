import React, { useState } from 'react';
import { FilterState } from '../types';
import { Map, Calendar, History, Folder, Edit2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { MapSelector } from './MapSelector';
import { DistrictList } from './DistrictList';

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectHistory?: (query: string) => void;
  activeQuery?: string;
  /** Record count per community district, shown beside each row in list view. */
  districtCounts?: Record<string, number>;
}

type HistoryItem = { id: string; name: string; query: string };
type Project = { id: string; name: string; isExpanded: boolean; items: HistoryItem[] };

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'NYC 311 Sanitation 2025',
    isExpanded: true,
    // 这里将原来的 5 个子项合并为 1 个总览项
    items: [
      { 
        id: 'h1', 
        name: 'Main Display · All Core Issues', 
        query: 'Show all trash, sewer, flooding, hygiene, and environmental blockage complaints' 
      }
    ]
  },
  {
    id: 'p2',
    name: 'Noise & Vibration',
    isExpanded: false,
    items: [
      { id: 'h6', name: 'Late-night Construction', query: 'Construction noise complaints between 10pm and 6am' },
      { id: 'h7', name: 'Loud Music — Residential', query: 'Residential loud music and party complaints by borough' },
      { id: 'h8', name: 'Helicopter Noise Hotspots', query: 'Helicopter noise complaints concentrated near East River' },
      { id: 'h9', name: 'Bar / Club Noise', query: 'Commercial noise from bars and clubs after midnight' },
    ]
  },
  {
    id: 'p3',
    name: 'Heat & Hot Water',
    isExpanded: false,
    items: [
      { id: 'h10', name: 'Winter Heat Outages', query: 'Heat or hot water outages during heat season Oct–May' },
      { id: 'h11', name: 'Repeat-offender Buildings', query: 'Buildings with 5+ HEAT/HOT WATER complaints in a year' },
      { id: 'h12', name: 'NYCHA vs Private', query: 'Compare heat outage rates between NYCHA and private housing' },
    ]
  },
  {
    id: 'p4',
    name: 'Street Safety',
    isExpanded: false,
    items: [
      { id: 'h13', name: 'Pothole Hot Zones', query: 'Pothole complaints clustered on arterial roads' },
      { id: 'h14', name: 'Blocked Bike Lanes', query: 'Illegal parking blocking protected bike lanes' },
      { id: 'h15', name: 'Damaged Street Signs', query: 'Missing, damaged or dangling street signs' },
      { id: 'h16', name: 'Traffic Signal Outages', query: 'Traffic signal condition complaints' },
    ]
  },
  {
    id: 'p5',
    name: 'Public Health',
    isExpanded: false,
    items: [
      { id: 'h17', name: 'Rat Mitigation Zones', query: 'Rodent complaints in DOHMH rat mitigation zones' },
      { id: 'h18', name: 'Lead Paint Risk', query: 'Lead paint complaints in pre-1960 buildings' },
      { id: 'h19', name: 'Indoor Air Quality', query: 'Indoor air quality and mold complaints' },
    ]
  },
  {
    id: 'p6',
    name: 'Housing Quality',
    isExpanded: false,
    items: [
      { id: 'h20', name: 'No-Heat Tickets', query: 'HPD violations issued for no heat in winter' },
      { id: 'h21', name: 'Plumbing Outages', query: 'Plumbing complaints concentrated in pre-war buildings' },
      { id: 'h22', name: 'Elevator Out-of-Service', query: 'Elevator complaints in 6+ floor buildings' },
    ]
  },
  {
    id: 'p7',
    name: 'Cross-cutting Issues',
    isExpanded: false,
    items: [
      { id: 'h23', name: 'Drain Blockages', query: 'Please help me find all trash data that causes drain blockages' },
      { id: 'h24', name: 'Illegal Dumping — Brooklyn', query: 'Analysis of illegal dumping in Brooklyn' },
      { id: 'h25', name: 'Tree-Sewer Conflicts', query: 'Tree root and sewer condition co-located complaints' },
    ]
  },
];

export const SidebarFilters = ({ filters, setFilters, onSelectHistory, activeQuery, districtCounts }: SidebarFiltersProps) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [areaView, setAreaView] = useState<'map' | 'list'>('map');

  const handleEditStart = (id: string, currentValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleEditSave = (id: string, type: 'project' | 'item', projectId?: string) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }

    if (type === 'project') {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: editValue } : p));
    } else if (type === 'item' && projectId) {
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        items: p.items.map(item => item.id === id ? { ...item, name: editValue } : item)
      } : p));
    }
    setEditingId(null);
  };

  const toggleProject = (projectId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const toggleBoard = (board: string) => {
    setFilters(prev => {
      const exists = prev.communityBoards.includes(board);
      return {
        ...prev,
        communityBoards: exists ? prev.communityBoards.filter(b => b !== board) : [...prev.communityBoards, board],
      };
    });
  };

  const setBoards = (codes: string[]) => {
    setFilters(prev => ({ ...prev, communityBoards: codes }));
  };

  const clearSpatial = () => {
    setFilters(prev => ({ ...prev, boroughs: [], communityBoards: [] }));
  };

  const hasSpatial = filters.communityBoards.length > 0;

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 border-r border-gray-200">
      
      {/* History Section */}
      <div className="p-4 border-b border-gray-100 flex-none max-h-[40%] overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3 flex items-center tracking-wider">
          <History className="w-3.5 h-3.5 mr-1.5" /> History
        </h3>
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id}>
              <div 
                className="flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-black cursor-pointer py-1 group mb-1"
                onClick={() => toggleProject(p.id)}
              >
                <div className="flex items-center overflow-hidden flex-1">
                  {p.isExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-400" />}
                  <Folder className="w-3 h-3 mr-1.5 flex-shrink-0 text-black fill-[#FFE300]" />
                  {editingId === p.id ? (
                    <input 
                      autoFocus
                      className="bg-white border-b border-black outline-none px-1 py-0 text-[11px] w-full mr-2 font-bold"
                      value={editValue}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleEditSave(p.id, 'project')}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditSave(p.id, 'project');
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="truncate">{p.name}</span>
                  )}
                </div>
                {editingId !== p.id && (
                  <button 
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-black transition-opacity"
                    onClick={(e) => handleEditStart(p.id, p.name, e)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {/* Project Items */}
              {p.isExpanded && (
                <div className="pl-5 space-y-1">
                  {p.items.map(item => (
                    <div key={item.id} className="relative group flex items-center">
                      {editingId === item.id ? (
                         <div className="w-full text-left text-xs p-1.5 font-medium rounded-sm border bg-white border-black">
                           <input
                             autoFocus
                             className="outline-none w-full bg-transparent text-black"
                             value={editValue}
                             onChange={e => setEditValue(e.target.value)}
                             onBlur={() => handleEditSave(item.id, 'item', p.id)}
                             onKeyDown={e => {
                               if (e.key === 'Enter') handleEditSave(item.id, 'item', p.id);
                               if (e.key === 'Escape') setEditingId(null);
                             }}
                           />
                         </div>
                      ) : (
                        <button 
                          onClick={() => onSelectHistory && onSelectHistory(item.query)}
                          className={`w-full text-left text-xs p-1.5 font-medium rounded-sm border transition-colors pr-6 truncate ${
                            activeQuery === item.query 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : 'bg-gray-50 text-gray-700 border-transparent hover:bg-black hover:text-[#FFE300]'
                          }`}
                        >
                          {item.name}
                        </button>
                      )}
                      {editingId !== item.id && (
                        <button 
                          className={`absolute right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                            activeQuery === item.query ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 hover:text-[#FFE300]'
                          }`}
                          onClick={(e) => handleEditStart(item.id, item.name, e)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Temporal Filter Section */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3 flex items-center tracking-wider">
          <Calendar className="w-3.5 h-3.5 mr-1.5" /> Time
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Start</label>
            <input 
              type="date" 
              className="w-full text-xs p-1.5 bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-black focus:bg-white transition-colors"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">End</label>
            <input 
              type="date" 
              className="w-full text-xs p-1.5 bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-black focus:bg-white transition-colors"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Spatial Filter Section — community-district picker */}
      <div className="p-4 border-b border-gray-100 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 flex items-center tracking-wider">
            <Map className="w-3.5 h-3.5 mr-1.5" /> Area · Community District
          </h3>
          {hasSpatial && (
            <button
              className="text-[9px] px-1.5 py-0.5 font-bold uppercase text-gray-600 hover:text-black border border-gray-300 rounded-sm bg-white"
              onClick={clearSpatial}
            >
              Clear
            </button>
          )}
        </div>

        {/* Map and list are two views onto the same selection. */}
        <div className="flex mb-2 bg-gray-100 p-0.5 rounded-sm border border-gray-200 shrink-0">
          {(['map', 'list'] as const).map(view => (
            <button
              key={view}
              onClick={() => setAreaView(view)}
              className={`flex-1 flex items-center justify-center gap-1 text-[10px] py-1 font-bold rounded-sm uppercase tracking-tight transition-colors ${
                areaView === view ? 'bg-black text-[#FFE300] shadow-sm' : 'text-gray-600 hover:bg-gray-200 hover:text-black'
              }`}
            >
              {view === 'map' ? <Map className="w-3 h-3" /> : <List className="w-3 h-3" />}
              {view}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-[240px] bg-white rounded-lg overflow-hidden shadow-sm">
          {areaView === 'map' ? (
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
              <MapSelector
                selectedDistricts={filters.communityBoards}
                onToggleDistrict={toggleBoard}
              />
            </div>
          ) : (
            <DistrictList
              selected={filters.communityBoards}
              onToggle={toggleBoard}
              onSetMany={setBoards}
              counts={districtCounts}
            />
          )}
        </div>
        {hasSpatial && (
          <p className="mt-1.5 text-[9px] text-gray-600 font-bold uppercase tracking-tight truncate" title={filters.communityBoards.join(', ')}>
            Selected: {filters.communityBoards.join(', ')}
          </p>
        )}
      </div>
      
    </div>
  );
};