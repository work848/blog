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

        <Route path="*" element={<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">404 - 页面不存在</div>} />
      </Routes>
    </Router>
  );
}
