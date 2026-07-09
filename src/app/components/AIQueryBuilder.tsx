import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import clsx from 'clsx';

interface AIQueryBuilderProps {
  onSearch: (query: string) => void;
  isProcessing: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

export const AIQueryBuilder = ({ onSearch, isProcessing, value, onChange }: AIQueryBuilderProps) => {
  const [internalQuery, setInternalQuery] = useState('');
  
  const query = value !== undefined ? value : internalQuery;
  const setQuery = onChange || setInternalQuery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearQuery = () => {
    setQuery('');
  };

  return (
    <div className="bg-[#FFE300] border-b border-black/10 overflow-hidden group">
      <div className="px-5 py-3 flex flex-col">
        <label htmlFor="ai-prompt" className="flex items-center space-x-1.5 text-black font-bold mb-2 uppercase tracking-tight text-[11px]">
          <Sparkles className="w-4 h-4" />
          <span>Extractor</span>
        </label>
        
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <textarea
            id="ai-prompt"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder='e.g., "Find all trash data causing drain blockages"'
            className="w-full text-black font-bold text-sm py-3 pl-3 pr-28 bg-white outline-none border border-black/20 rounded-md focus:border-black resize-none min-h-[50px] placeholder:text-gray-400 placeholder:font-normal shadow-sm"
            rows={2}
          />
          
          <div className="absolute right-2 flex items-center space-x-2 top-1/2 -translate-y-1/2">
            {query && !isProcessing && (
              <button 
                type="button" 
                onClick={clearQuery}
                className="p-1 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className={clsx(
                "flex items-center justify-center px-3 py-1.5 rounded-md font-bold uppercase text-[11px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent",
                isProcessing 
                  ? "bg-gray-400 text-black border-black" 
                  : "bg-black hover:bg-gray-800 text-[#FFE300]"
              )}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="mr-1.5">Extract</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
        <div className="mt-2 flex space-x-2 text-[10px] text-black items-center">
          <span className="font-bold uppercase tracking-tight">Try:</span>
          <button onClick={() => setQuery("Show flooding and drainage issues")} className="font-medium hover:bg-black hover:text-[#FFE300] px-1 py-0.5 rounded transition-colors">Flooding</button>
          <button onClick={() => setQuery("Find illegal dumping hotspots")} className="font-medium hover:bg-black hover:text-[#FFE300] px-1 py-0.5 rounded transition-colors">Illegal Dumping</button>
          <button onClick={() => setQuery("List all rat sightings")} className="font-medium hover:bg-black hover:text-[#FFE300] px-1 py-0.5 rounded transition-colors">Rodents</button>
        </div>
      </div>
    </div>
  );
};
