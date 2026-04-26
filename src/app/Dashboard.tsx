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

// Sanitation_set sub-buckets from src/asset/311_2025_sanitation_filtering.ipynb.
// Each subcategory.name is the actual NYC 311 "Problem (formerly Complaint Type)"
// value, so the existing complaintType matcher in filteredData picks it up.
const BUCKET_A_TRASH = [
  { id: 'a-dirty', name: 'Dirty Condition' },
  { id: 'a-missed', name: 'Missed Collection' },
  { id: 'a-illegal', name: 'Illegal Dumping' },
  { id: 'a-litter-c', name: 'Litter Basket Complaint' },
  { id: 'a-litter-r', name: 'Litter Basket Request' },
  { id: 'a-recycling', name: 'Recycling Basket Complaint' },
  { id: 'a-resi', name: 'Residential Disposal Complaint' },
  { id: 'a-comm', name: 'Commercial Disposal Complaint' },
  { id: 'a-inst', name: 'Institution Disposal Complaint' },
  { id: 'a-dump', name: 'Dumpster Complaint' },
  { id: 'a-sweep', name: 'Street Sweeping Complaint' },
  { id: 'a-worker', name: 'Sanitation Worker or Vehicle Complaint' },
  { id: 'a-transfer', name: 'Transfer Station Complaint' },
  { id: 'a-dsny', name: 'DSNY Internal' },
];
const BUCKET_B_SEWER = [
  { id: 'b-sewer', name: 'Sewer' },
  { id: 'b-root', name: 'Root/Sewer/Sidewalk Condition' },
  { id: 'b-indoor', name: 'Indoor Sewage' },
  { id: 'b-industrial', name: 'Industrial Waste' },
  { id: 'b-leak', name: 'WATER LEAK' },
  { id: 'b-water', name: 'Water System' },
];
const BUCKET_C_FLOOD = [
  { id: 'c-standing', name: 'Standing Water' },
  { id: 'c-conserve', name: 'Water Conservation' },
  { id: 'c-quality', name: 'Water Quality' },
  { id: 'c-curb', name: 'Curb Condition' },
  { id: 'c-street', name: 'Street Condition' },
  { id: 'c-highway', name: 'Highway Condition' },
  { id: 'c-dep-st', name: 'DEP Street Condition' },
  { id: 'c-dep-sw', name: 'DEP Sidewalk Condition' },
  { id: 'c-dep-hw', name: 'DEP Highway Condition' },
  { id: 'c-sw', name: 'Sidewalk Condition' },
];
const BUCKET_D_HYGIENE = [
  { id: 'd-rodent', name: 'Rodent' },
  { id: 'd-mosquito', name: 'Mosquitoes' },
  { id: 'd-dead', name: 'Dead Animal' },
  { id: 'd-unsan', name: 'UNSANITARY CONDITION' },
  { id: 'd-toilet', name: 'Public Toilet' },
  { id: 'd-urin', name: 'Urinating in Public' },
  { id: 'd-pigeon', name: 'Unsanitary Pigeon Condition' },
  { id: 'd-animal-pvt', name: 'Unsanitary Animal Pvt Property' },
  { id: 'd-animal-fac', name: 'Unsanitary Animal Facility' },
];
const BUCKET_E_BLOCKAGE = [
  { id: 'e-tree', name: 'Overgrown Tree/Branches' },
  { id: 'e-wood', name: 'Wood Pile Remaining' },
  { id: 'e-lot', name: 'Lot Condition' },
  { id: 'e-obstr', name: 'Obstruction' },
  { id: 'e-aban', name: 'Abandoned Vehicle' },
  { id: 'e-derelict', name: 'Derelict Vehicles' },
];

const BUCKETS = {
  a: { id: 'bucket-a', title: 'A · Trash, Collection & Sweeping', color: 'bg-white border-gray-200', subCategories: BUCKET_A_TRASH },
  b: { id: 'bucket-b', title: 'B · Sewer & Wastewater', color: 'bg-white border-gray-200', subCategories: BUCKET_B_SEWER },
  c: { id: 'bucket-c', title: 'C · Flooding, Drainage & Streets', color: 'bg-white border-gray-200', subCategories: BUCKET_C_FLOOD },
  d: { id: 'bucket-d', title: 'D · Hygiene & Pests', color: 'bg-white border-gray-200', subCategories: BUCKET_D_HYGIENE },
  e: { id: 'bucket-e', title: 'E · Blockage & Environment', color: 'bg-white border-gray-200', subCategories: BUCKET_E_BLOCKAGE },
};

function buildCategoriesForQuery(query: string): MainCategory[] {
  const q = query.toLowerCase();

  const wants = {
    a: /\b(trash|garbage|litter|basket|sweep|sweeping|dump|dumping|missed|collection|recycl|disposal|dsny|sanitation worker|transfer station)\b/.test(q),
    b: /\b(sewer|sewage|wastewater|water leak|water system|industrial waste|root)\b/.test(q),
    c: /\b(flood|flooding|drain|drainage|standing water|street condition|sidewalk|highway|curb|water quality|water conservation|pothole)\b/.test(q),
    d: /\b(hygiene|pest|rodent|rat|mosquito|dead animal|unsanitary|public toilet|urinat|pigeon|animal)\b/.test(q),
    e: /\b(block|blockage|obstruct|abandoned|derelict|tree|branch|wood|lot)\b/.test(q),
  };

  const anyMatch = Object.values(wants).some(Boolean);
  // Default: pull anything sanitation-relevant
  const useAll = !anyMatch;

  const main: MainCategory[] = [];
  if (useAll || wants.a) main.push(BUCKETS.a);
  if (useAll || wants.b) main.push(BUCKETS.b);
  if (useAll || wants.c) main.push(BUCKETS.c);
  if (useAll || wants.d) main.push(BUCKETS.d);
  if (useAll || wants.e) main.push(BUCKETS.e);

  // Always include an Excluded bucket so the user can drag irrelevant items out.
  const allChosen = new Set(main.flatMap(c => c.subCategories.map(s => s.id)));
  const excluded: MainCategory = {
    id: 'excluded',
    title: 'Excluded (Irrelevant)',
    color: 'bg-gray-100 border-gray-200',
    subCategories: [
      ...BUCKET_A_TRASH, ...BUCKET_B_SEWER, ...BUCKET_C_FLOOD,
      ...BUCKET_D_HYGIENE, ...BUCKET_E_BLOCKAGE,
    ].filter(s => !allChosen.has(s.id)),
  };
  main.push(excluded);
  return main;
}

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    boroughs: [],
    communityBoards: [],
  });

  const [categories, setCategories] = useState<MainCategory[]>(() => buildCategoriesForQuery('Please help me find all trash data that causes drain blockages'));
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [activeQuery, setActiveQuery] = useState('Please help me find all trash data that causes drain blockages');

  // Handle AI Query — maps query keywords to the sanitation_set sub-buckets.
  const handleAIQuery = (query: string) => {
    setIsProcessingAI(true);
    setActiveQuery(query);
    setTimeout(() => {
      setCategories(buildCategoriesForQuery(query));
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
        rightSidebar={<AnalyticsSidebar data={filteredData} />}
        content={
          <div className="flex flex-col h-full">
            {/* Sticky prompt input — always visible at top of middle column */}
            <div className="shrink-0 border-b border-black/10 shadow-sm z-10">
              <AIQueryBuilder
                onSearch={handleAIQuery}
                isProcessing={isProcessingAI}
                value={activeQuery}
                onChange={setActiveQuery}
              />
            </div>

            {/* Scrollable workspace below */}
            <div className="flex-1 overflow-auto p-6 flex flex-col space-y-4 min-h-0">
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
          </div>
        }
      />
    </DndProvider>
  );
}