import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-slate-200/60 shadow-xl">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <TopBar />
        </div>
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">DigiLocker</span>
            <span className="text-xs text-primary font-semibold">by OM</span>
          </div>
          <div className="text-sm text-slate-600">Welcome</div>
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0 mobile-scroll">
          <div className="px-4 py-4 lg:px-8 lg:py-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
        <BottomNav />
      </div>
    </div>
  );
}
