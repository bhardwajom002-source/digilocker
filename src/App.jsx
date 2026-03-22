import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

// New Mobile App Screens
import SplashScreen from './pages/SplashScreen';
import AuthScreen from './pages/AuthScreen';
import RegisterScreen from './pages/RegisterScreen';
import LoginScreen from './pages/LoginScreen';

// Existing Screens
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isSetupComplete) {
    return <Navigate to="/register" replace />;
  }

  if (!isUnlocked) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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

  return <Navigate to="/login" replace />;
}

export default function App() {
  const { isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Mobile App Flow */}
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/" element={<Navigate to="/splash" replace />} />
      
      {/* Auth Flow */}
      <Route path="/auth" element={<PublicRoute><AuthScreen /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
      
      {/* Legacy routes - redirect to new flow */}
      <Route path="/onboarding" element={<Navigate to="/auth" replace />} />
      <Route path="/setup" element={<Navigate to="/register" replace />} />
      <Route path="/lock" element={<Navigate to="/login" replace />} />
      
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
