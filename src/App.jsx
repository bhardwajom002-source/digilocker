import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Onboarding from './pages/Onboarding';
import SetupPassword from './pages/SetupPassword';
import LockScreen from './pages/LockScreen';
import Dashboard from './pages/Dashboard';
import Family from './pages/Family';
import MemberDocs from './pages/MemberDocs';
import Upload from './pages/Upload';
import DocumentView from './pages/DocumentView';
import Search from './pages/Search';
import Categories from './pages/Categories';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Backup from './pages/Backup';
import ActivityLog from './pages/ActivityLog';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isSetupComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!isUnlocked) {
    return <Navigate to="/lock" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isSetupComplete) {
    return children;
  }

  if (isUnlocked) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/lock" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes - only accessible when locked or not setup */}
      <Route path="/onboarding" element={<PublicRoute><Onboarding /></PublicRoute>} />
      <Route path="/setup" element={<PublicRoute><SetupPassword /></PublicRoute>} />
      <Route path="/lock" element={<PublicRoute><LockScreen /></PublicRoute>} />
      
      {/* Protected routes - require unlocked state */}
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="family" element={<Family />} />
        <Route path="family/:memberId" element={<MemberDocs />} />
        <Route path="upload" element={<Upload />} />
        <Route path="upload/:memberId" element={<Upload />} />
        <Route path="document/:docId" element={<DocumentView />} />
        <Route path="search" element={<Search />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:category" element={<Categories />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="backup" element={<Backup />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
