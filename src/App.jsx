import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Component } from 'react';
import AppShell        from './components/layout/AppShell';
import SplashScreen    from './pages/SplashScreen';
import AuthScreen      from './pages/AuthScreen';
import RegisterScreen  from './pages/RegisterScreen';
import LoginScreen     from './pages/LoginScreen';
import ForgotPassword  from './pages/ForgotPassword';
import RegisterSuccess from './pages/RegisterSuccess';
import Dashboard       from './pages/Dashboard';
import Family          from './pages/Family';
import MemberDocs      from './pages/MemberDocs';
import Upload          from './pages/Upload';
import DocumentView    from './pages/DocumentView';
import Search          from './pages/Search';
import Categories      from './pages/Categories';
import Notifications   from './pages/Notifications';
import Settings        from './pages/Settings';
import Backup          from './pages/Backup';
import ActivityLog     from './pages/ActivityLog';
import Reports         from './pages/Reports';
import NotFound        from './pages/NotFound';

// ─── Error Boundary ──────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Restart
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── SIMPLE LOADING (NO BLOCKING) ────────────────────────────
function Loading() {
  return <div style={{ padding: 20 }}>Loading...</div>;
}

// ─── Protected Route ─────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();

  // ❌ Spinner removed (bot block hota tha)
  if (isLoading) return <Loading />;

  if (!isSetupComplete) return <Navigate to="/auth" replace />;
  if (!isUnlocked) return <Navigate to="/login" replace />;

  return children;
}

// ─── Public Route ────────────────────────────────────────────
function PublicRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();

  // ❌ Spinner removed
  if (isLoading) return children;

  if (isSetupComplete && isUnlocked) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const { isLoading } = useAuth();

  // ❌ Infinite spinner removed
  if (isLoading) return <Loading />;

  return (
    <ErrorBoundary>
      <Routes>

        {/* Splash */}
        <Route path="/splash" element={<SplashScreen />} />

        {/* Public */}
        <Route path="/auth" element={<PublicRoute><AuthScreen /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />

        {/* Open */}
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* 🔥 ROOT FIX — PUBLIC ACCESS */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
          <Route path="family/:memberId" element={<ProtectedRoute><MemberDocs /></ProtectedRoute>} />
          <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="upload/:memberId" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="document/:docId" element={<ProtectedRoute><DocumentView /></ProtectedRoute>} />
          <Route path="search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="categories/:category" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
          <Route path="activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
        <Route index element={<Navigate to="/splash" replace />} />

      </Routes>
    </ErrorBoundary>
  );
}
