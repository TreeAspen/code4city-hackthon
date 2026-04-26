import React, { useState, useMemo } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { SidebarFilters } from './components/SidebarFilters';
import { AIQueryBuilder } from './components/AIQueryBuilder';
import { CategoryBoard } from './components/CategoryBoard';
import { DataPreview } from './components/DataPreview';
import { AnalyticsSidebar } from './components/AnalyticsSidebar';
import { FilterState, Incident311, MainCategory, SubCategory } from './types';
import { mockData311 } from './mockData';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    boroughs: [],
    communityBoards: [],
  });

  const [categories, setCategories] = useState<MainCategory[]>([
    {
      id: 'organic',
      title: 'Organic Matter (Cause A)',
      color: 'bg-white border-gray-200',
      subCategories: [
        { id: 'sub-1', name: 'Leaves & Twigs' },
        { id: 'sub-2', name: 'Soil / Dirt' },
        { id: 'sub-3', name: 'Grass Clippings' },
      ],
    },
    {
      id: 'street',
      title: 'Street Debris (Cause B)',
      color: 'bg-white border-gray-200',
      subCategories: [
        { id: 'sub-4', name: 'Plastic Bags' },
        { id: 'sub-5', name: 'Coffee Cups / Bottles' },
        { id: 'sub-6', name: 'Newspapers' },
      ],
    },
    {
      id: 'construction',
      title: 'Construction (Cause C)',
      color: 'bg-white border-gray-200',
      subCategories: [
        { id: 'sub-7', name: 'Gravel / Sand' },
        { id: 'sub-8', name: 'Cement Mix' },
      ],
    },
    {
      id: 'excluded',
      title: 'Excluded (Irrelevant)',
      color: 'bg-gray-100 border-gray-200',
      subCategories: [
        { id: 'sub-9', name: 'Rat Sighting' },
        { id: 'sub-10', name: 'Noise - Street' },
      ],
    },
  ]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [activeQuery, setActiveQuery] = useState('Please help me find all trash data that causes drain blockages');

  // Handle AI Query
  const handleAIQuery = (query: string) => {
    setIsProcessingAI(true);
    setActiveQuery(query);
    // Simulate AI extraction based on query
    setTimeout(() => {
      const q = query.toLowerCase();
      if (q.includes('drain') || q.includes('block') || q.includes('trash') || q.includes('dumping')) {
        setCategories([
          {
            id: 'organic',
            title: 'Organic Matter (Cause A)',
            color: 'bg-white border-gray-200',
            subCategories: [
              { id: 'sub-1', name: 'Leaves & Twigs' },
              { id: 'sub-2', name: 'Soil / Dirt' },
              { id: 'sub-3', name: 'Grass Clippings' },
            ],
          },
          {
            id: 'street',
            title: 'Street Debris (Cause B)',
            color: 'bg-white border-gray-200',
            subCategories: [
              { id: 'sub-4', name: 'Plastic Bags' },
              { id: 'sub-5', name: 'Coffee Cups / Bottles' },
              { id: 'sub-6', name: 'Newspapers' },
            ],
          },
          {
            id: 'construction',
            title: 'Construction (Cause C)',
            color: 'bg-white border-gray-200',
            subCategories: [
              { id: 'sub-7', name: 'Gravel / Sand' },
              { id: 'sub-8', name: 'Cement Mix' },
            ],
          },
          {
            id: 'excluded',
            title: 'Excluded (Irrelevant)',
            color: 'bg-gray-100 border-gray-200',
            subCategories: [
              { id: 'sub-9', name: 'Rat Sighting' },
              { id: 'sub-10', name: 'Noise - Street' },
            ],
          },
        ]);
      } else {
        setCategories([
          {
            id: 'general',
            title: 'General Trash',
            color: 'bg-white border-black',
            subCategories: [
              { id: 'sub-1', name: 'Household Waste' },
              { id: 'sub-2', name: 'Bulky Items' },
            ],
          },
          {
            id: 'excluded',
            title: 'Excluded',
            color: 'bg-gray-200 border-black',
            subCategories: [
              { id: 'sub-3', name: 'Noise' },
              { id: 'sub-4', name: 'Graffiti' },
            ],
          },
        ]);
      }
      setIsProcessingAI(false);
    }, 1500);
  };

  const handleUpdateCategory = (categoryId: string, title: string) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, title } : c));
  }

  const handleRemoveCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }

  const handleMoveSubCategory = (subId: string, fromCatId: string, toCatId: string) => {
    if (fromCatId === toCatId) return;

    setCategories((prev) => {
      const fromCat = prev.find(c => c.id === fromCatId);
      const toCat = prev.find(c => c.id === toCatId);
      if (!fromCat || !toCat) return prev;

      const subCategory = fromCat.subCategories.find(s => s.id === subId);
      if (!subCategory) return prev;

      return prev.map(c => {
        if (c.id === fromCatId) {
          return { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) };
        }
        if (c.id === toCatId) {
          return { ...c, subCategories: [...c.subCategories, subCategory] };
        }
        return c;
      });
    });
  };

  const handleRemoveSubCategory = (subId: string, catId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) };
      }
      return c;
    }));
  };

  const handleAddSubCategory = (catId: string, subId: string) => {
    // If it's just selecting an existing one, we need to find it first from all categories
    // and move it to this category.
    const allSubs = categories.flatMap(c => c.subCategories);
    const sub = allSubs.find(s => s.id === subId);
    if (!sub) return;

    // We can reuse handleMoveSubCategory logic: find where it comes from
    const fromCat = categories.find(c => c.subCategories.some(s => s.id === subId));
    if (fromCat && fromCat.id !== catId) {
      handleMoveSubCategory(subId, fromCat.id, catId);
    }
  };

  const handleAddMainCategory = (title: string) => {
    setCategories(prev => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        title,
        color: 'bg-white border-black',
        subCategories: []
      }
    ]);
  }

  // Derive filtered data based on categories and other filters
  const filteredData = useMemo(() => {
    let data = mockData311;

    // Apply Time Filter
    data = data.filter(d => d.createdDate >= filters.startDate && d.createdDate <= filters.endDate);

    // Apply Spatial Filter (Mutually Exclusive)
    if (filters.boroughs.length > 0) {
      data = data.filter(d => filters.boroughs.includes(d.borough));
    } else if (filters.communityBoards.length > 0) {
      // Assuming mock data has communityBoard field or we simulate it by string match.
      // (Mock data might not have a perfect communityBoard match, but we implement the logic here)
      data = data.filter(d => filters.communityBoards.includes(d.communityBoard || ''));
    }

    // Apply Category Filter if categories are set
    if (categories.length > 0) {
      // Gather all subcategory names to match with descriptors or types (mocking the semantic match)
      const allowedSubCategoryNames = categories
        .filter(c => c.id !== 'excluded') // Exclude the excluded category
        .flatMap(c => c.subCategories.map(s => s.name.toLowerCase()));
      
      data = data.filter(d => {
        const desc = d.descriptor.toLowerCase();
        const type = d.complaintType.toLowerCase();
        return allowedSubCategoryNames.some(s => desc.includes(s) || type.includes(s));
      });
    }

    return data;
  }, [filters, categories]);

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardLayout
        sidebar={<SidebarFilters filters={filters} setFilters={setFilters} onSelectHistory={handleAIQuery} activeQuery={activeQuery} />}
        rightSidebar={<AnalyticsSidebar data={filteredData} filters={filters} setFilters={setFilters} />}
        content={
          <div className="flex flex-col h-full space-y-4">
            <AIQueryBuilder 
              onSearch={handleAIQuery} 
              isProcessing={isProcessingAI}
              value={activeQuery}
              onChange={setActiveQuery}
            />
            
            {activeQuery && (
              <div className="flex-1 min-h-[400px] overflow-hidden bg-white flex flex-col border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="px-4 py-3 border-b-2 border-black bg-white flex justify-between items-center">
                  <h3 className="font-bold text-black uppercase tracking-tight text-sm">Semantic Classification for: "{activeQuery}"</h3>
                  <p className="text-xs font-bold text-black uppercase tracking-tight">Drag to reassign, or use 'Add Item' to move existing subcategories.</p>
                </div>
                <CategoryBoard 
                  categories={categories} 
                  allSubCategories={categories.flatMap(c => c.subCategories)}
                  onMoveSub={handleMoveSubCategory}
                  onRemoveSub={handleRemoveSubCategory}
                  onAddSub={handleAddSubCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onRemoveCategory={handleRemoveCategory}
                  onAddMainCategory={handleAddMainCategory}
                />
              </div>
            )}

            <div className="h-1/3 min-h-[300px] overflow-hidden flex flex-col">
              <DataPreview data={filteredData} />
            </div>
          </div>
        }
      />
    </DndProvider>
  );
}