import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-heading font-bold text-slate-200">404</div>
      <h1 className="font-heading text-2xl font-bold text-slate-900 mt-4">Page Not Found</h1>
      <p className="text-slate-600 mt-2 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
        <button
          onClick={() => navigate('/search')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </div>
  );
}
