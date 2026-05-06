import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import ToastContainer from '@/components/common/Toast';
import Dashboard from '@/components/dashboard/Dashboard';
import Buscador from '@/components/buscador/Buscador';
import Venta from '@/components/venta/Venta';
import Administrar from '@/components/administrar/Administrar';

function AppContent() {
  const { currentPage, isSidebarCollapsed } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'inicio':
        return <Dashboard />;
      case 'buscar':
        return <Buscador />;
      case 'venta':
        return <Venta />;
      case 'administrar':
        return <Administrar />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <main className={`${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[240px]'} min-h-screen transition-all duration-300 ease-in-out`}>
        {renderPage()}
      </main>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
