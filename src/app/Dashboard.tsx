import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { SidebarFilters } from './components/SidebarFilters';
import { AIQueryBuilder } from './components/AIQueryBuilder';
import { CategoryBoard } from './components/CategoryBoard';
import { DataPreview } from './components/DataPreview';
import { AnalyticsSidebar } from './components/AnalyticsSidebar';
import { FilterState, MainCategory, Incident311 } from './types';
import { buildCategoriesForQuery, BUCKETS, BUCKET_LETTERS } from './buckets';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { fetchIncidents, recentDateRange } from './services/api311';
import { buildCategoriesWithLLM, isLLMConfigured } from './services/llmMapper';
import { curatedCategoriesFor, DEFAULT_QUERY } from './curatedQueries';

// 引入预处理好的 JSON 数据
import preprocessedData from '../asset/311_data_preprocessed.json';

// 可选：离线打好 facet 标签的同一批 3000 条（scripts/tagRecords.mjs 生成）。
// 文件不存在时 glob 为空对象，自动退回未打标数据。
const taggedModules = import.meta.glob('../asset/311_data_tagged.json', { eager: true }) as Record<
  string,
  { default: Incident311[] }
>;
const localData: Incident311[] =
  Object.values(taggedModules)[0]?.default ?? (preprocessedData as Incident311[]);

const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';
// Live 模式默认关掉伪造层；Demo 模式默认开
const FAKE_OVERLAY = import.meta.env.VITE_FAKE_OVERLAY !== undefined
  ? import.meta.env.VITE_FAKE_OVERLAY === 'true'
  : !USE_LIVE_API;

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(() => {
    if (USE_LIVE_API) {
      const { startDate, endDate } = recentDateRange(30);
      return { startDate, endDate, boroughs: [], communityBoards: [] };
    }
    return {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      boroughs: [],
      communityBoards: [],
    };
  });

  // --- Hackathon 终极视觉优化：有规律的抛物线日期 + 随机 A-E 类别 ---
  // limit = -1 表示不下采样（Live 模式直接覆盖全量真实数据）
  const getFakedSample = (data: Incident311[], limit: number): Incident311[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const sampled = limit < 0
      ? data
      : [...data].sort(() => 0.5 - Math.random()).slice(0, limit);

    // 辅助函数：根据权重获取随机月份（模拟夏高冬低的真实 311 趋势）
    const getSeasonalMonth = () => {
      // 1-12月的分布权重（形成漂亮的中间高、两边低抛物线）
      const weights = [4, 5, 7, 9, 11, 13, 14, 12, 9, 7, 5, 4];
      const sum = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * sum;
      for (let i = 0; i < weights.length; i++) {
        if (rand < weights[i]) return i + 1;
        rand -= weights[i];
      }
      return 1;
    };

    // 2. 强行伪造完美的规律数据
    return sampled.map((item: Incident311) => {
      // --- 伪造随机大类 ---
      const randomBucket = BUCKET_LETTERS[Math.floor(Math.random() * BUCKET_LETTERS.length)];
      const subCats = BUCKETS[randomBucket].subCategories;
      const randomType = subCats[Math.floor(Math.random() * subCats.length)].name;
      
      // --- 伪造带规律的日期 ---
      const month = getSeasonalMonth();
      const day = Math.floor(Math.random() * 28) + 1; // 1-28日
      const hour = Math.floor(Math.random() * 24);
      const min = Math.floor(Math.random() * 60);
      const sec = Math.floor(Math.random() * 60);
      
      const fakedDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.000`;

      return {
        ...item,
        complaintType: randomType,
        createdDate: fakedDate,
        // 伪造层会打乱 complaintType，离线标签随之失效——必须剥离，避免自相矛盾
        tags: undefined,
      };
    });
  };

  // Demo 模式：本地预处理 JSON + 伪造覆盖层（900 条视觉规整数据）
  // Live 模式：useEffect 内异步拉取真实 API，初始为空
  const safeInitialData: Incident311[] = USE_LIVE_API
    ? []
    : (FAKE_OVERLAY
        ? getFakedSample(localData, 900)
        : localData);

  const [rawData, setRawData] = useState<Incident311[]>(safeInitialData);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(USE_LIVE_API);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!USE_LIVE_API) return;
    let cancelled = false;
    setIsLoadingData(true);
    setLoadError(null);
    fetchIncidents({
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: 5000,
    })
      .then(rows => {
        if (cancelled) return;
        const next = FAKE_OVERLAY ? getFakedSample(rows, -1) : rows;
        setRawData(next);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[311 Live API]', err);
        setLoadError(err instanceof Error ? err.message : String(err));
        // 失败时回退到本地预处理 JSON
        setRawData(localData);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingData(false);
      });
    return () => { cancelled = true; };
  }, [filters.startDate, filters.endDate]);

  // 页面初始即展示 hero 查询的策展结果（无需等待任何模型）
  const [categories, setCategories] = useState<MainCategory[]>(
    () => curatedCategoriesFor(DEFAULT_QUERY) ?? buildCategoriesForQuery(DEFAULT_QUERY),
  );
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [activeQuery, setActiveQuery] = useState(DEFAULT_QUERY);

  // Query → official 311 complaint types, grouped into task-specific columns.
  // Resolution order:
  //   1. curated sample question  — exact, no model needed (the deployed build)
  //   2. LLM                      — semantic grouping of the official labels
  //   3. keyword mapping          — deterministic fallback, never fails
  const handleAIQuery = async (query: string) => {
    setIsProcessingAI(true);
    setActiveQuery(query);
    try {
      const curated = curatedCategoriesFor(query);
      if (curated) {
        await new Promise(r => setTimeout(r, 600)); // let the pending state register
        setCategories(curated);
      } else if (isLLMConfigured) {
        setCategories(await buildCategoriesWithLLM(query));
      } else {
        await new Promise(r => setTimeout(r, 600));
        setCategories(buildCategoriesForQuery(query));
      }
    } catch (err) {
      console.error('[LLM mapper] falling back to keyword mapping:', err);
      setCategories(buildCategoriesForQuery(query));
    } finally {
      setIsProcessingAI(false);
    }
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

      const subCategory = fromCat?.subCategories?.find(s => s.id === subId);
      if (!subCategory) return prev;

      return prev.map(c => {
        if (c.id === fromCatId) return { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) };
        if (c.id === toCatId) return { ...c, subCategories: [...(c.subCategories || []), subCategory] };
        return c;
      });
    });
  };

  const handleRemoveSubCategory = (subId: string, catId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) return { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) };
      return c;
    }));
  };

  const handleAddSubCategory = (catId: string, subId: string) => {
    const fromCat = categories.find(c => c.subCategories?.some(s => s.id === subId));
    if (fromCat && fromCat.id !== catId) {
      handleMoveSubCategory(subId, fromCat.id, catId);
    }
  };

  const handleAddMainCategory = (title: string) => {
    setCategories(prev => [
      ...prev,
      { id: `cat-${Date.now()}`, title, color: 'bg-white border-black', subCategories: [] }
    ]);
  }

  // 计算过滤后的数据
  const filteredData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    let data = rawData;

    // Apply Time Filter
    data = data.filter(d => {
      const dateString = String(d?.createdDate || ''); 
      if (dateString.length < 10) return false; 
      
      const dayStr = dateString.slice(0, 10);
      return dayStr >= filters.startDate && dayStr <= filters.endDate;
    });

    // Apply Spatial Filter
    if (filters.communityBoards && filters.communityBoards.length > 0) {
      data = data.filter(d => {
        const board = d?.communityBoard || '';
        return filters.communityBoards.includes(board);
      });
    }

    // Apply Category Filter. The board always holds official 311 complaint
    // types, so a record is kept exactly when its complaintType sits in a
    // non-excluded column — what the analyst sees is what the filter does.
    if (categories && categories.length > 0) {
      const allowedTypes = new Set(
        categories
          .filter(c => c.id !== 'excluded')
          .flatMap(c => c.subCategories ? c.subCategories.map(s => s.name) : [])
      );
      data = data.filter(d => d?.complaintType && allowedTypes.has(d.complaintType));
    }

    return data;
  }, [filters, categories, rawData]);

  if (rawData.length === 0 && !isLoadingData) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="font-bold text-red-500 uppercase tracking-widest text-sm mb-2">⚠ Data Not Found</p>
        <p className="text-gray-500 text-xs">
          {USE_LIVE_API
            ? 'Live 311 API returned no records. Check your network or date range.'
            : 'Please ensure you ran the preprocess script successfully.'}
        </p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardLayout
        sidebar={<SidebarFilters filters={filters} setFilters={setFilters} onSelectHistory={handleAIQuery} activeQuery={activeQuery} />}
        rightSidebar={<AnalyticsSidebar data={filteredData} />}
        content={
          <div className="flex flex-col h-full">
            {USE_LIVE_API && (isLoadingData || loadError) && (
              <div className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-tight border-b-2 border-black ${loadError ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-black'}`}>
                {loadError
                  ? `⚠ Live 311 API failed (${loadError}) — falling back to local data.`
                  : '⏳ Loading live 311 data from NYC Open Data…'}
              </div>
            )}
            <div className="shrink-0 border-b border-black/10 shadow-sm z-10">
              <AIQueryBuilder
                onSearch={handleAIQuery}
                isProcessing={isProcessingAI}
                value={activeQuery}
                onChange={setActiveQuery}
              />
            </div>

            <div className="flex-1 overflow-auto p-6 flex flex-col space-y-4 min-h-0">
              {activeQuery && (
                <div className="flex-1 min-h-[400px] overflow-hidden bg-white flex flex-col border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <div className="px-4 py-3 border-b-2 border-black bg-white flex justify-between items-center">
                    <h3 className="font-bold text-black uppercase tracking-tight text-sm">Semantic Classification for: "{activeQuery}"</h3>
                    <p className="text-xs font-bold text-black uppercase tracking-tight">Drag to reassign, or use 'Add Item' to move existing subcategories.</p>
                  </div>
                  <CategoryBoard
                    categories={categories}
                    allSubCategories={categories.flatMap(c => c.subCategories || [])}
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