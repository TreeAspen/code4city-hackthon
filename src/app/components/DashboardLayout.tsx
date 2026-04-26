import React, { ReactNode } from 'react';
import { Database, UserCircle, Download, LayoutDashboard } from 'lucide-react';
import { Resizable } from 're-resizable';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';

interface LayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  rightSidebar?: ReactNode;
}

export const DashboardLayout = ({ sidebar, content, rightSidebar }: LayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      {/* Resizable Left Sidebar */}
      <Resizable
        defaultSize={{
          width: 320,
          height: '100%',
        }}
        minWidth={250}
        maxWidth={500}
        enable={{ right: true }}
        handleClasses={{ right: "hover:bg-gray-300 bg-transparent transition-colors w-1.5 cursor-col-resize -right-0.5 z-20 absolute top-0 bottom-0" }}
        className="border-r border-gray-200 bg-white flex flex-col h-full z-10 shrink-0"
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0 space-x-3 bg-[#FFE300]">
          <div className="bg-black p-1.5 rounded">
            <Database className="w-4 h-4 text-[#FFE300]" />
          </div>
          <div>
            <h1 className="font-bold text-black text-sm leading-tight uppercase tracking-tight">NYC 311</h1>
            <p className="text-[9px] text-black/80 font-bold uppercase tracking-wider">Workspace</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {sidebar}
        </div>
      </Resizable>

      {/* Main Content Area (Flexible) */}
      <main className="flex-1 flex flex-col min-w-[400px]">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-black font-bold">
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-bold text-sm uppercase tracking-tight">Workspace</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-[#FFE300] px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors outline-none">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-md">
                <DropdownMenuItem className="text-xs font-bold cursor-pointer hover:bg-gray-100">
                  Export as Shapefile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-bold cursor-pointer hover:bg-gray-100">
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-bold cursor-pointer hover:bg-gray-100">
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-bold cursor-pointer hover:bg-gray-100">
                  Export as GeoJSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <button className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors">
              <UserCircle className="w-5 h-5" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Expert</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 flex flex-col min-w-0 bg-gray-50">
          {content}
        </div>
      </main>

      {/* Resizable Right Sidebar */}
      {rightSidebar && (
        <Resizable
          defaultSize={{
            width: 384,
            height: '100%',
          }}
          minWidth={300}
          maxWidth={600}
          enable={{ left: true }}
          handleClasses={{ left: "hover:bg-gray-300 bg-transparent transition-colors w-1.5 cursor-col-resize -left-0.5 z-20 absolute top-0 bottom-0" }}
          className="border-l border-gray-200 bg-white flex flex-col h-full z-10 shrink-0 shadow-sm"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {rightSidebar}
          </div>
        </Resizable>
      )}
    </div>
  );
};