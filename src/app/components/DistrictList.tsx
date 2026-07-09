import React, { useMemo, useState } from 'react';
import { Search, Check, X } from 'lucide-react';
import { DISTRICTS_BY_BOROUGH, ALL_DISTRICT_CODES } from '../districts';

interface DistrictListProps {
  selected: string[];
  onToggle: (code: string) => void;
  onSetMany: (codes: string[]) => void;
  /** Record count per district, for the counts shown next to each row. */
  counts?: Record<string, number>;
}

// Conventional grouped multi-select: search, per-borough select-all, per-row
// checkbox. Mirrors the map — clicking either updates the same filter state.
export const DistrictList = ({ selected, onToggle, onSetMany, counts }: DistrictListProps) => {
  const [search, setSearch] = useState('');
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const groups = useMemo(() => {
    const q = search.trim().toUpperCase();
    if (!q) return DISTRICTS_BY_BOROUGH;
    return DISTRICTS_BY_BOROUGH.map(g => ({
      ...g,
      codes: g.name.toUpperCase().includes(q)
        ? g.codes
        : g.codes.filter(c => c.includes(q)),
    })).filter(g => g.codes.length > 0);
  }, [search]);

  const toggleBorough = (codes: string[]) => {
    const allOn = codes.every(c => selectedSet.has(c));
    const next = allOn
      ? selected.filter(c => !codes.includes(c))
      : [...new Set([...selected, ...codes])];
    onSetMany(next);
  };

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 shrink-0">
        <Search className="w-3 h-3 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search district or borough"
          className="w-full bg-transparent outline-none text-[11px] placeholder:text-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-black shrink-0">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 text-[9px] font-bold uppercase tracking-tight shrink-0">
        <span className="text-gray-500">{selected.length} of {ALL_DISTRICT_CODES.length} selected</span>
        <div className="flex gap-1.5">
          <button className="text-gray-600 hover:text-black underline" onClick={() => onSetMany(ALL_DISTRICT_CODES)}>All</button>
          <button className="text-gray-600 hover:text-black underline" onClick={() => onSetMany([])}>None</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {groups.length === 0 && (
          <p className="p-3 text-[10px] text-gray-400 text-center">No district matches "{search}"</p>
        )}
        {groups.map(group => {
          const allOn = group.codes.every(c => selectedSet.has(c));
          const someOn = !allOn && group.codes.some(c => selectedSet.has(c));
          return (
            <div key={group.prefix}>
              <button
                onClick={() => toggleBorough(group.codes)}
                className="w-full flex items-center justify-between px-2 py-1 sticky top-0 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 border rounded-[3px] flex items-center justify-center ${
                      allOn ? 'bg-black border-black' : someOn ? 'bg-white border-black' : 'bg-white border-gray-300'
                    }`}
                  >
                    {allOn && <Check className="w-2.5 h-2.5 text-[#FFE300]" strokeWidth={4} />}
                    {someOn && <span className="w-1.5 h-0.5 bg-black" />}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-black">{group.name}</span>
                </span>
                <span className="text-[9px] text-gray-400 font-bold">{group.codes.length}</span>
              </button>

              {group.codes.map(code => {
                const on = selectedSet.has(code);
                return (
                  <button
                    key={code}
                    onClick={() => onToggle(code)}
                    className={`w-full flex items-center justify-between pl-6 pr-2 py-1 text-left transition-colors ${
                      on ? 'bg-[#FFE300]/25' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 border rounded-[3px] flex items-center justify-center ${
                          on ? 'bg-black border-black' : 'bg-white border-gray-300'
                        }`}
                      >
                        {on && <Check className="w-2.5 h-2.5 text-[#FFE300]" strokeWidth={4} />}
                      </span>
                      <span className={`text-[11px] font-medium ${on ? 'text-black' : 'text-gray-600'}`}>{code}</span>
                    </span>
                    {counts && (
                      <span className="text-[9px] text-gray-400 tabular-nums">{counts[code] ?? 0}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
