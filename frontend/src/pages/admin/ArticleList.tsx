import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { getAllArticles, deleteArticle, batchDelete } from '@/api/article';
import type { Article } from '@/types';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

export default function ArticleList() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'batch'; id?: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const result = await getAllArticles(page, pageSize, status);
      setArticles(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('加载文章列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [page, statusFilter]);

  const filteredArticles = useMemo(() => {
    if (!searchKeyword.trim()) return articles;
    const keyword = searchKeyword.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(keyword) ||
        article.tags.some((tag) => tag.name.toLowerCase().includes(keyword)) ||
        article.category?.name.toLowerCase().includes(keyword)
    );
  }, [articles, searchKeyword]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredArticles.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTarget({ type: 'single', id });
    setShowDeleteConfirm(true);
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setDeleteTarget({ type: 'batch' });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      if (deleteTarget.type === 'single' && deleteTarget.id !== undefined) {
        await deleteArticle(deleteTarget.id);
      } else if (deleteTarget.type === 'batch') {
        await batchDelete(Array.from(selectedIds));
      }
      setSelectedIds(new Set());
      loadArticles();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAllSelected = filteredArticles.length > 0 && filteredArticles.every((a) => selectedIds.has(a.id));
  const isIndeterminate = filteredArticles.some((a) => selectedIds.has(a.id)) && !isAllSelected;

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          文章管理
        </h1>
        <p className="text-gray-400">管理您的所有文章，支持批量操作和状态筛选</p>
      </div>

      <div className="bg-[#121212] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center gap-4">
          <button
            onClick={() => navigate('/admin/articles/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-lg transition-all duration-200 font-medium"
          >
            <Plus size={18} />
            新建文章
          </button>

          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="搜索标题、标签或分类..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'PUBLISHED', 'DRAFT'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
                }`}
              >
                {status === 'ALL' ? '全部' : status === 'PUBLISHED' ? '已发布' : '草稿'}
              </button>
            ))}
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDeleteClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 font-medium"
            >
              <Trash2 size={18} />
              批量删除 ({selectedIds.size})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left w-12">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                        isAllSelected || isIndeterminate
                          ? 'bg-[#ff6b35] border-[#ff6b35]'
                          : 'border-gray-600 hover:border-[#ff6b35]'
                      }`}
                    >
                      {isAllSelected && <Check size={14} className="text-white" />}
                      {isIndeterminate && !isAllSelected && (
                        <div className="w-2.5 h-0.5 bg-white rounded" />
                      )}
                    </div>
                  </label>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 w-32">分类</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 w-48">标签</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 w-28">状态</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 w-44">发布时间</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="animate-spin text-[#ff6b35] mx-auto" size={32} />
                    <p className="text-gray-500 mt-4">加载中...</p>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-gray-500 text-lg">暂无文章</p>
                    <p className="text-gray-600 text-sm mt-2">
                      {searchKeyword ? '尝试调整搜索条件' : '点击"新建文章"开始创作'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(article.id)}
                          onChange={(e) => handleSelect(article.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div
                          className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                            selectedIds.has(article.id)
                              ? 'bg-[#ff6b35] border-[#ff6b35]'
                              : 'border-gray-600 group-hover:border-[#ff6b35]'
                          }`}
                        >
                          {selectedIds.has(article.id) && <Check size={14} className="text-white" />}
                        </div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                        className="text-left text-white hover:text-[#ff6b35] transition-colors font-medium truncate max-w-md block"
                        title={article.title}
                      >
                        {article.title}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {article.category ? (
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${article.category.color}20`,
                            color: article.category.color,
                          }}
                        >
                          {article.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded"
                          >
                            #{tag.name}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          article.status === 'PUBLISHED'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-lg transition-all duration-200"
                          title="编辑"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(article.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              共 {total} 条记录，第 {page} / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setPage(pageNum);
                      setSelectedIds(new Set());
                    }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? 'bg-[#ff6b35] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">确认删除</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {deleteTarget?.type === 'single'
                    ? '确定要删除这篇文章吗？'
                    : `确定要删除选中的 ${selectedIds.size} 篇文章吗？`}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-6 pl-16">此操作无法撤销，删除后数据将永久丢失。</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-500/90 text-white font-medium transition-all duration-200 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
