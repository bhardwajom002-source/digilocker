import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Component } from 'react';
import AppShell        from './components/layout/AppShell';
import SplashScreen    from './pages/SplashScreen';
import AuthScreen      from './pages/AuthScreen';
import RegisterScreen  from './pages/RegisterScreen';
import LoginScreen     from './pages/LoginScreen';
import ForgotPassword  from './pages/ForgotPassword';
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
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          background: '#fff',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            {this.state.error?.message || 'Unexpected error occurred'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            style={{
              background: '#2563EB', color: '#fff', border: 'none',
              borderRadius: 14, padding: '12px 24px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
            Restart App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Spinner ─────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
    }}>
      <div style={{
        width: 44, height: 44,
        border: '4px solid #DBEAFE',
        borderTopColor: '#2563EB',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Protected Route — must be logged in ─────────────────────
function ProtectedRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isSetupComplete) return <Navigate to="/auth" replace />;
  if (!isUnlocked) return <Navigate to="/login" replace />;
  return children;
}

// ─── Public Route — only for guests ─────────────────────────
function PublicRoute({ children }) {
  const { isUnlocked, isSetupComplete, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  // Already logged in → dashboard pe bhejo
  if (isSetupComplete && isUnlocked) return <Navigate to="/" replace />;
  return children;
}

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const { isLoading } = useAuth();
  if (isLoading) return <Spinner />;

  return (
    <ErrorBoundary>
      <Routes>

        {/* Splash — always accessible */}
        <Route path="/splash" element={<SplashScreen />} />

        {/* Public routes — sirf non-logged in users ke liye */}
        <Route path="/auth"     element={<PublicRoute><AuthScreen /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><LoginScreen /></PublicRoute>} />
        <Route path="/forgot"   element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Protected routes — sirf logged in users ke liye */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="family"                element={<Family />} />
          <Route path="family/:memberId"      element={<MemberDocs />} />
          <Route path="upload"                element={<Upload />} />
          <Route path="upload/:memberId"      element={<Upload />} />
          <Route path="document/:docId"       element={<DocumentView />} />
          <Route path="search"                element={<Search />} />
          <Route path="categories"            element={<Categories />} />
          <Route path="categories/:category"  element={<Categories />} />
          <Route path="notifications"         element={<Notifications />} />
          <Route path="settings"              element={<Settings />} />
          <Route path="backup"                element={<Backup />} />
          <Route path="activity"              element={<ActivityLog />} />
          <Route path="reports"               element={<Reports />} />
        </Route>

        {/* Root redirect → splash */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
