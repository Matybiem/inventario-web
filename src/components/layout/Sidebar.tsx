import { useApp } from '@/context/AppContext';
import type { Page } from '@/types';
import { LayoutDashboard, Search, Receipt, Package, ChevronRight } from 'lucide-react';

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'inicio', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
  { page: 'buscar', label: 'Buscar', icon: <Search size={20} /> },
  { page: 'venta', label: 'Venta', icon: <Receipt size={20} /> },
  { page: 'administrar', label: 'Administrar Stock', icon: <Package size={20} /> },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, syncStatus } = useApp();

  return (
    <aside className="w-[240px] min-h-screen bg-white border-r border-[#E5E5E5] flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <ChevronRight size={18} className="text-[#1A1A1A]" />
          <div>
            <h1 className="text-[16px] font-bold text-[#1A1A1A] leading-tight">Inventario on-line</h1>
            <p className="text-[12px] text-[#999]">Descubre</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => setCurrentPage(item.page)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium rounded-lg
              transition-all duration-150
              ${currentPage === item.page
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
              }
            `}
          >
            <span className={currentPage === item.page ? 'text-white' : ''}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sync Status */}
      <div className="px-5 py-4 border-t border-[#E5E5E5]">
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
          <span className="text-[11px] text-[#999]">
            {syncStatus === 'connected' ? 'Sincronizado' : 'Desconectado'}
          </span>
        </div>
      </div>
    </aside>
  );
}
