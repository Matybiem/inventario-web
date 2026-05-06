import { useApp } from '@/context/AppContext';
import type { Page } from '@/types';
import { LayoutDashboard, Search, Receipt, Package, Menu } from 'lucide-react';

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'inicio', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
  { page: 'buscar', label: 'Buscar', icon: <Search size={20} /> },
  { page: 'venta', label: 'Venta', icon: <Receipt size={20} /> },
  { page: 'administrar', label: 'Administrar Stock', icon: <Package size={20} /> },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, syncStatus, isSidebarCollapsed, setIsSidebarCollapsed } = useApp();

  return (
    <aside className={`
      ${isSidebarCollapsed ? 'w-[70px]' : 'w-[240px]'} 
      min-h-screen bg-white border-r border-[#E5E5E5] flex flex-col fixed left-0 top-0 z-50
      transition-all duration-300 ease-in-out
    `}>
      {/* Header */}
      <div className={`px-5 pt-6 pb-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          title={isSidebarCollapsed ? "Expandir" : "Colapsar"}
        >
          <Menu size={20} className="text-[#1A1A1A]" />
        </button>
        {!isSidebarCollapsed && (
          <h1 className="text-[16px] font-bold text-[#1A1A1A] leading-tight whitespace-nowrap overflow-hidden">
            Inventario on-line
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => setCurrentPage(item.page)}
            className={`
              w-full flex items-center rounded-lg text-[14px] font-medium
              transition-all duration-150
              ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
              ${currentPage === item.page
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
              }
            `}
            title={isSidebarCollapsed ? item.label : undefined}
          >
            <span className={currentPage === item.page ? 'text-white' : ''}>
              {item.icon}
            </span>
            {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Sync Status */}
      <div className={`py-4 border-t border-[#E5E5E5] ${isSidebarCollapsed ? 'flex justify-center' : 'px-5'}`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {syncStatus === 'connected' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]"></span>
            )}
          </span>
          {!isSidebarCollapsed && (
            <span className="text-[11px] text-[#999] whitespace-nowrap">
              {syncStatus === 'connected' ? 'Sincronizado' : 'Desconectado'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
