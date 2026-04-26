import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, X } from 'lucide-react';
import { SubCategory } from '../types';

interface DraggableSubCategoryProps {
  subCategory: SubCategory;
  categoryId: string;
  onRemove: (subId: string, catId: string) => void;
  index: number;
}

export const ItemTypes = {
  SUB_CATEGORY: 'sub_category',
};

export const DraggableSubCategory = ({ subCategory, categoryId, onRemove, index }: DraggableSubCategoryProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SUB_CATEGORY,
    item: { id: subCategory.id, categoryId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [subCategory.id, categoryId, index]);

  drag(ref);

  return (
    <div
      ref={ref}
      className={`group flex items-center justify-between p-2 mb-2 bg-white border border-gray-200 rounded-md shadow-sm transition-all hover:bg-[#FFE300] hover:shadow-md cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 scale-95 shadow-none bg-gray-100' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
        <GripVertical className="w-3.5 h-3.5 text-black flex-shrink-0 group-hover:text-black transition-colors" />
        <span className="text-[11px] font-bold text-black truncate tracking-tight uppercase" title={subCategory.name}>
          {subCategory.name}
        </span>
      </div>
      <button
        onClick={() => onRemove(subCategory.id, categoryId)}
        className="p-1 text-black hover:text-white rounded-none opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 bg-white hover:bg-red-600 border border-black"
        title="Remove item"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
