import React, { useState } from 'react';
import { FilterState } from '../types';
import { Map, Calendar, MapPin, Search, History, Folder, Edit2, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectHistory?: (query: string) => void;
  activeQuery?: string;
}

type HistoryItem = { id: string; name: string; query: string };
type Project = { id: string; name: string; isExpanded: boolean; items: HistoryItem[] };

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'NYC 311 Sanitation 2025',
    isExpanded: true,
    items: [
      { id: 'h1', name: 'A · Trash, Collection & Sweeping', query: 'Show all trash, missed collection, illegal dumping, baskets and street sweeping complaints' },
      { id: 'h2', name: 'B · Sewer & Wastewater', query: 'Show sewer backups, indoor sewage, industrial waste, water leaks and water system complaints' },
      { id: 'h3', name: 'C · Flooding, Drainage & Streets', query: 'Show standing water, street and sidewalk condition complaints related to drainage and flooding' },
      { id: 'h4', name: 'D · Hygiene & Pests', query: 'Show rodent, mosquito, dead animal, unsanitary conditions and public toilet complaints' },
      { id: 'h5', name: 'E · Blockage & Environment', query: 'Show overgrown trees, wood piles, lot conditions, obstructions and abandoned/derelict vehicles' },
    ]
  },
  {
    id: 'p2',
    name: 'Cross-cutting Issues',
    isExpanded: true,
    items: [
      { id: 'h6', name: 'Drain Blockages', query: 'Please help me find all trash data that causes drain blockages' },
      { id: 'h7', name: 'Illegal Dumping', query: 'Analysis of illegal dumping in Brooklyn' },
    ]
  }
];

const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
const COMMUNITY_BOARDS = [
  'MN-01', 'MN-03', 'MN-05', 
  'BK-01', 'BK-02', 'BK-05',
  'QN-01', 'QN-02', 'QN-07',
  'BX-03', 'BX-04', 'BX-05',
  'SI-01', 'SI-02'
];

export const SidebarFilters = ({ filters, setFilters, onSelectHistory, activeQuery }: SidebarFiltersProps) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [geoLevel, setGeoLevel] = useState<'borough' | 'community'>('borough');

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

  const toggleBorough = (borough: string) => {
    setFilters(prev => ({
      ...prev,
      boroughs: prev.boroughs.includes(borough)
        ? prev.boroughs.filter(b => b !== borough)
        : [...prev.boroughs, borough]
    }));
  };

  const toggleBoard = (board: string) => {
    setFilters(prev => ({
      ...prev,
      communityBoards: prev.communityBoards.includes(board)
        ? prev.communityBoards.filter(b => b !== board)
        : [...prev.communityBoards, board]
    }));
  };

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

      {/* Spatial Filter Section */}
      <div className="p-4 border-b border-gray-100 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 flex items-center tracking-wider">
            <Map className="w-3.5 h-3.5 mr-1.5" /> Area
          </h3>
          <span className="text-[10px] bg-[#FFE300] text-black border border-black/20 rounded px-2 py-0.5 font-bold uppercase">NYC Map</span>
        </div>

        {/* Mock Map Area */}
        <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden group shadow-sm">
          <MapPin className="text-gray-400 w-8 h-8" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all flex items-center justify-center cursor-pointer">
            <span className="text-sm font-bold text-black opacity-0 group-hover:opacity-100 bg-[#FFE300] px-3 py-1.5 rounded-md shadow-sm">Select on Map</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex bg-gray-50 p-1 border border-gray-100 rounded-sm">
            <button
              className={`flex-1 text-[10px] font-bold uppercase py-1.5 px-2 rounded-sm transition-colors ${geoLevel === 'borough' ? 'bg-[#FFE300] text-black shadow-sm' : 'text-gray-500 hover:bg-gray-200 hover:text-black'}`}
              onClick={() => {
                setGeoLevel('borough');
                setFilters(prev => ({ ...prev, communityBoards: [] }));
              }}
            >
              Boroughs
            </button>
            <button
              className={`flex-1 text-[10px] font-bold uppercase py-1.5 px-2 rounded-sm transition-colors ${geoLevel === 'community' ? 'bg-[#FFE300] text-black shadow-sm' : 'text-gray-500 hover:bg-gray-200 hover:text-black'}`}
              onClick={() => {
                setGeoLevel('community');
                setFilters(prev => ({ ...prev, boroughs: [] }));
              }}
            >Community Boards</button>
          </div>

          {geoLevel === 'borough' && (
            <div className="space-y-1.5">
              {BOROUGHS.map(b => (
                <label key={b} className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="form-checkbox text-black rounded-sm border-gray-300 focus:ring-black w-3.5 h-3.5 cursor-pointer accent-black"
                    checked={filters.boroughs.includes(b)}
                    onChange={() => toggleBorough(b)}
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">{b}</span>
                </label>
              ))}
            </div>
          )}

          {geoLevel === 'community' && (
            <div>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search boards..." 
                  className="w-full text-[10px] py-1.5 pl-7 pr-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-black"
                />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                {COMMUNITY_BOARDS.map(cb => (
                  <label key={cb} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="form-checkbox text-black rounded-sm border-gray-300 focus:ring-black w-3.5 h-3.5 cursor-pointer accent-black"
                      checked={filters.communityBoards.includes(cb)}
                      onChange={() => toggleBoard(cb)}
                    />
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-900 transition-colors">{cb}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
