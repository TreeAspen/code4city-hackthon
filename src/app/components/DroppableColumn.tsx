import React, { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { MainCategory, SubCategory } from '../types';
import { ItemTypes, DraggableSubCategory } from './DraggableSubCategory';
import { Plus, Settings2, Trash2, Edit2, Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface DroppableColumnProps {
  category: MainCategory;
  allSubCategories: { id: string; name: string }[];
  onMoveSub: (subId: string, fromCatId: string, toCatId: string) => void;
  onRemoveSub: (subId: string, catId: string) => void;
  onAddSub: (catId: string, name: string) => void;
  onUpdateCategory: (catId: string, title: string) => void;
  onRemoveCategory: (catId: string) => void;
}

export const DroppableColumn = ({ 
  category, 
  allSubCategories,
  onMoveSub, 
  onRemoveSub, 
  onAddSub,
  onUpdateCategory,
  onRemoveCategory
}: DroppableColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(category.title);
  const [isAddingSub, setIsAddingSub] = useState(false);

  const safeAllSubCategories = allSubCategories || [];
  const currentSubIds = new Set(category.subCategories?.map(s => s.id) || []);
  const availableSubCategories = safeAllSubCategories.filter(s => !currentSubIds.has(s.id));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.SUB_CATEGORY,
    drop: (item: { id: string, categoryId: string }) => {
      onMoveSub(item.id, item.categoryId, category.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [category.id, onMoveSub]);

  drop(ref);

  const handleTitleSubmit = () => {
    if (titleValue.trim()) {
      onUpdateCategory(category.id, titleValue.trim());
    } else {
      setTitleValue(category.title);
    }
    setIsEditingTitle(false);
  };

  const bgClasses = category.color || 'bg-gray-100 border-gray-300';
  const isActive = isOver && canDrop;

  return (
    <div 
      ref={ref} 
      className={clsx(
        "flex flex-col h-full border border-gray-200 rounded-lg transition-colors duration-200 overflow-hidden shrink-0 w-64 max-h-full flex-grow relative pb-4 shadow-sm group/col",
        bgClasses,
        isActive ? "bg-opacity-100 border-black bg-[#FFE300]" : "bg-opacity-100 bg-white"
      )}
    >
      <div className={clsx("p-2.5 border-b border-gray-200 flex justify-between items-center transition-colors z-10 sticky top-0 bg-white/90", 
        category.id === 'excluded' ? 'bg-gray-200' : ''
      )}>
        {isEditingTitle ? (
          <div className="flex items-center space-x-1.5 flex-1">
            <input 
              autoFocus
              className="text-xs font-bold bg-white text-black p-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black/10 w-full uppercase tracking-tight"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
              onBlur={handleTitleSubmit}
            />
            <button onMouseDown={handleTitleSubmit} className="text-white bg-black hover:bg-gray-800 p-1 rounded border border-black"><Check className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <>
            <h4 
              className={clsx(
                "font-bold text-xs tracking-tight truncate pr-2 uppercase", 
                category.id === 'excluded' ? 'text-gray-500 line-through decoration-black decoration-2' : 'text-black'
              )} 
              title={category.title}
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {category.title}
              <span className="ml-1.5 text-[10px] font-bold text-black py-0.5 px-1.5 bg-[#FFE300] border border-black rounded inline-block">{category.subCategories.length}</span>
            </h4>
            <div className="flex items-center opacity-0 group-hover/col:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsEditingTitle(true)}
                className="p-1.5 text-black hover:text-[#FFE300] transition-colors hover:bg-black rounded" title="Rename Group"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {category.id !== 'excluded' && (
                <button 
                  onClick={() => onRemoveCategory(category.id)}
                  className="p-1.5 text-black hover:text-white transition-colors hover:bg-red-600 rounded ml-1" title="Delete Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 p-2 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth">
        {category.subCategories.map((sub, index) => (
          <DraggableSubCategory 
            key={sub.id} 
            index={index}
            subCategory={sub} 
            categoryId={category.id} 
            onRemove={onRemoveSub} 
          />
        ))}
        {category.subCategories.length === 0 && !isActive && (
          <div className="flex flex-col items-center justify-center h-24 text-black font-bold uppercase tracking-tight text-xs border border-gray-300 rounded-md bg-gray-50 m-2">
            <span>Empty Group</span>
            <span className="text-[10px] font-medium normal-case">Drag items here</span>
          </div>
        )}
      </div>

      <div className="px-3 pt-2 mt-auto relative">
        {isAddingSub ? (
          <div className="absolute bottom-full left-0 right-0 mb-1 mx-3 bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] z-20 max-h-48 overflow-y-auto custom-scrollbar">
            {availableSubCategories.length === 0 ? (
              <div className="p-2 text-xs text-gray-500 font-bold text-center">No available items</div>
            ) : (
              <div className="flex flex-col">
                {availableSubCategories.map(sub => (
                  <button
                    key={sub.id}
                    className="text-left text-xs font-bold p-2 hover:bg-[#FFE300] hover:text-black border-b border-gray-100 last:border-0 transition-colors"
                    onClick={() => {
                      onAddSub(category.id, sub.id);
                      setIsAddingSub(false);
                    }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
        
        {isAddingSub ? (
          <button 
            onClick={() => setIsAddingSub(false)}
            className="w-full py-2 flex items-center justify-between px-3 text-xs font-bold uppercase tracking-tight text-black bg-[#FFE300] border-2 border-black rounded-md mb-1"
          >
            <span>Cancel</span>
            <ChevronDown className="w-4 h-4 transform rotate-180" />
          </button>
        ) : (
          <button 
            onClick={() => setIsAddingSub(true)}
            className="w-full py-2 flex items-center justify-center text-xs font-bold uppercase tracking-tight text-black hover:text-black hover:bg-[#FFE300] transition-colors border-2 border-black rounded-md bg-white mb-1"
          >
            <Plus className="w-4 h-4 mr-1 stroke-[3]" />
            Add Item
          </button>
        )}
      </div>
    </div>
  );
};
