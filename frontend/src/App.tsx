import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import ArticleDetail from '@/pages/ArticleDetail';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ArticleList from '@/pages/admin/ArticleList';
import ArticleEdit from '@/pages/admin/ArticleEdit';
import CategoryTag from '@/pages/admin/CategoryTag';
import DraftList from '@/pages/admin/DraftList';
import ParticleBackground from '@/components/ParticleBackground';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import HankoAvatar from '@/components/HankoAvatar';

function NotFound() {
  return (
    <div className="min-h-screen bg-aiiro-deep flex items-center justify-center px-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0" />
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <HankoAvatar size="xl" text="無" />
        </div>
        <h1
          className="text-7xl md:text-9xl font-bold text-gradient mb-4 font-serif-display"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          404
        </h1>
        <p
          className="text-xl text-aiiro-muted mb-2 font-serif-jp"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          ページが見つかりません
        </p>
        <p className="text-aiiro-muted/60 mb-10">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 glass-card rounded-xl text-aiiro-light hover:text-aiiro-accent transition-colors group"
        >
          <HomeIcon size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span
            className="font-serif-jp tracking-wider"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            ホームへ戻る
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/article/:id" element={<ArticleDetail />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/new" element={<ArticleEdit />} />
          <Route path="articles/:id/edit" element={<ArticleEdit />} />
          <Route path="categories" element={<CategoryTag />} />
          <Route path="drafts" element={<DraftList />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
