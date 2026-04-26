import React, { useState } from 'react';
import { MainCategory } from '../types';
import { DroppableColumn } from './DroppableColumn';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

interface CategoryBoardProps {
  categories: MainCategory[];
  allSubCategories: { id: string; name: string }[];
  onMoveSub: (subId: string, fromCatId: string, toCatId: string) => void;
  onRemoveSub: (subId: string, catId: string) => void;
  onAddSub: (catId: string, name: string) => void;
  onUpdateCategory: (catId: string, title: string) => void;
  onRemoveCategory: (catId: string) => void;
  onAddMainCategory: (title: string) => void;
}

export const CategoryBoard = ({ 
  categories, 
  allSubCategories,
  onMoveSub, 
  onRemoveSub, 
  onAddSub,
  onUpdateCategory,
  onRemoveCategory,
  onAddMainCategory
}: CategoryBoardProps) => {
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupValue, setNewGroupValue] = useState('');

  const handleAddSubmit = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newGroupValue.trim()) {
      onAddMainCategory(newGroupValue.trim());
      setNewGroupValue('');
      setIsAddingGroup(false);
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="flex-1 overflow-x-auto custom-scrollbar p-4 flex gap-4 min-h-0 bg-gray-50 relative">
      <div className="flex space-x-4 min-h-full">
        {categories.map((cat) => (
          <DroppableColumn
            key={cat.id}
            category={cat}
            allSubCategories={allSubCategories}
            onMoveSub={onMoveSub}
            onRemoveSub={onRemoveSub}
            onAddSub={onAddSub}
            onUpdateCategory={onUpdateCategory}
            onRemoveCategory={onRemoveCategory}
          />
        ))}

        {/* Add Group Column */}
        <div className={clsx(
          "flex flex-col h-full border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors overflow-hidden shrink-0 w-64 justify-center items-center shadow-sm",
          isAddingGroup && "p-3 justify-start items-stretch bg-gray-50"
        )}>
          {isAddingGroup ? (
            <div className="flex flex-col space-y-2 w-full animate-in fade-in zoom-in-95 duration-200">
              <label className="text-[10px] font-bold text-black uppercase tracking-tight block">New Group</label>
              <input 
                autoFocus
                className="text-xs p-1.5 w-full border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-black/10 bg-white text-black font-bold"
                placeholder="e.g. Traffic..."
                value={newGroupValue}
                onChange={e => setNewGroupValue(e.target.value)}
                onKeyDown={handleAddSubmit}
                onBlur={() => {
                  if(!newGroupValue.trim()) setIsAddingGroup(false);
                }}
              />
              <div className="flex items-center space-x-1.5">
                <button 
                  onMouseDown={handleAddSubmit}
                  className="flex-1 py-1 bg-black text-[#FFE300] rounded-sm text-[10px] font-bold uppercase tracking-tight hover:bg-gray-800 transition-colors"
                >
                  Create
                </button>
                <button 
                  onMouseDown={() => setIsAddingGroup(false)}
                  className="px-2 py-1 bg-white border border-gray-300 rounded-sm text-black text-[10px] font-bold uppercase tracking-tight hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingGroup(true)}
              className="flex flex-col items-center justify-center text-black w-full h-full p-4 transition-all group"
            >
              <div className="p-2 bg-black text-[#FFE300] rounded-full mb-2 transition-colors shadow-sm group-hover:shadow-md">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-tight">Add Group</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
