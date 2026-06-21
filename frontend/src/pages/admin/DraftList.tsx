import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Square,
  Send,
  Trash2,
  Edit3,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import {
  getDrafts,
  batchPublish,
  updateArticle,
  deleteArticle,
} from '@/api/article';
import type { Article } from '@/types';
import { cn } from '@/lib/utils';

export default function DraftList() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [publishingIds, setPublishingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const pageSize = 10;

  const loadDrafts = async (pageNum: number) => {
    setLoading(true);
    try {
      const result = await getDrafts(pageNum, pageSize);
      setDrafts(result.list);
      setTotal(result.total);
      setPage(result.page);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('加载草稿失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts(1);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === drafts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(drafts.map((d) => d.id)));
    }
  };

  const handleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBatchPublish = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setPublishingIds(new Set(ids));
    try {
      await batchPublish(ids);
      setDrafts((prev) => prev.filter((d) => !ids.includes(d.id)));
      setSelectedIds(new Set());
      if (drafts.length - ids.length === 0 && page > 1) {
        loadDrafts(page - 1);
      }
    } catch (error) {
      console.error('批量发布失败:', error);
    } finally {
      setPublishingIds(new Set());
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 篇草稿吗？`)) return;

    const ids = Array.from(selectedIds);
    setDeletingIds(new Set(ids));
    try {
      await Promise.all(ids.map((id) => deleteArticle(id)));
      setDrafts((prev) => prev.filter((d) => !ids.includes(d.id)));
      setSelectedIds(new Set());
      if (drafts.length - ids.length === 0 && page > 1) {
        loadDrafts(page - 1);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setDeletingIds(new Set());
    }
  };

  const handlePublish = async (id: number) => {
    setPublishingIds((prev) => new Set(prev).add(id));
    try {
      await updateArticle(id, { status: 'PUBLISHED' });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (drafts.length - 1 === 0 && page > 1) {
        loadDrafts(page - 1);
      }
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setPublishingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这篇草稿吗？')) return;

    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteArticle(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (drafts.length - 1 === 0 && page > 1) {
        loadDrafts(page - 1);
      }
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const isAllSelected = drafts.length > 0 && selectedIds.size === drafts.length;
  const hasSelected = selectedIds.size > 0;

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          草稿箱
        </h1>
        <p className="text-gray-400">管理您的草稿文章</p>
      </div>

      <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
              isAllSelected
                ? 'text-[#ff6b35]'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {isAllSelected ? (
              <CheckSquare size={20} />
            ) : (
              <Square size={20} />
            )}
            <span className="text-sm">全选</span>
          </button>
          {hasSelected && (
            <span className="text-sm text-gray-400">
              已选择 {selectedIds.size} 项
            </span>
          )}
          </div>

          <div className="flex items-center gap-3">
          <button
            onClick={handleBatchPublish}
            disabled={!hasSelected || publishingIds.size > 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
              hasSelected
                ? 'bg-[#ff6b35] text-white hover:bg-[#ff6b35]/90'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            )}
          >
            {publishingIds.size > 0 ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
            <span className="text-sm font-medium">批量发布</span>
          </button>

          <button
            onClick={handleBatchDelete}
            disabled={!hasSelected || deletingIds.size > 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
              hasSelected
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            )}
          >
            {deletingIds.size > 0 ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            <span className="text-sm font-medium">删除选中</span>
          </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#ff6b35]" size={32} />
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FolderOpen size={64} className="text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">暂无草稿</p>
            <p className="text-sm text-gray-500 mt-2">
              您的草稿会显示在这里</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {drafts.map((draft) => {
                const isSelected = selectedIds.has(draft.id);
                const isPublishing = publishingIds.has(draft.id);
                const isDeleting = deletingIds.has(draft.id);
                const isProcessing = isPublishing || isDeleting;

                return (
                  <div
                    key={draft.id}
                    className={cn(
                      'p-4 hover:bg-white/[0.02] transition-colors duration-200',
                      isSelected && 'bg-[#ff6b35]/5'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleSelect(draft.id)}
                        disabled={isProcessing}
                        className={cn(
                          'mt-1 transition-colors duration-200',
                          isProcessing
                            ? 'text-gray-600 cursor-not-allowed'
                            : isSelected
                            ? 'text-[#ff6b35]'
                            : 'text-gray-500 hover:text-white'
                        )}
                      >
                        {isSelected ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText
                            size={16}
                            className="text-[#ff6b35] flex-shrink-0"
                          />
                          <h3 className="text-lg font-medium text-white truncate">
                            {draft.title}
                          </h3>
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {draft.summary || '暂无摘要'}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(draft.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/articles/${draft.id}/edit`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">
                          <Edit3 size={14} />
                          <span>编辑</span>
                        </button>

                        <button
                          onClick={() => handlePublish(draft.id)}
                          disabled={isProcessing}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-200',
                            isProcessing
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-[#ff6b35] hover:bg-[#ff6b35]/10'
                          )}
                        >
                          {isPublishing ? (
                            <Loader2
                              className="animate-spin"
                              size={14}
                            />
                          ) : (
                              <Send size={14} />
                            )}
                          <span>{isPublishing ? '发布中' : '发布'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(draft.id)}
                          disabled={isProcessing}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-200',
                            isProcessing
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-red-400 hover:text-red-400 hover:bg-red-500/10'
                          )}
                        >
                          {isDeleting ? (
                            <Loader2
                              className="animate-spin"
                              size={14}
                            />
                          ) : (
                              <Trash2 size={14} />
                            )}
                          <span>{isDeleting ? '删除中' : '删除'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  共 {total} 条，第 {page} / {totalPages} 页
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadDrafts(page - 1)}
                    disabled={page <= 1}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                      page > 1
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 cursor-not-allowed'
                    )}
                  >
                    <ChevronLeft size={16} />
                    <span>上一页</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => loadDrafts(p)}
                          className={cn(
                            'w-8 h-8 text-sm rounded-lg transition-all duration-200',
                            p === page
                              ? 'bg-[#ff6b35] text-white'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => loadDrafts(page + 1)}
                    disabled={page >= totalPages}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
                      page < totalPages
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 cursor-not-allowed'
                    )}
                  >
                    <span>下一页</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
