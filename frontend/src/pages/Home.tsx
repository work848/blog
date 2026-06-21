import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Tag as TagIcon, ChevronRight, Loader2, Settings } from 'lucide-react';
import { getPublishedArticles, getLikeStatus, likeArticle } from '@/api/article';
import type { Article, LikeResponse } from '@/types';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likeStatuses, setLikeStatuses] = useState<Record<number, LikeResponse>>({});
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());

  const loadArticles = async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const result = await getPublishedArticles(pageNum, 10);
      if (reset) {
        setArticles(result.list);
      } else {
        setArticles((prev) => [...prev, ...result.list]);
      }
      setHasMore(pageNum * 10 < result.total);
      setPage(pageNum);

      result.list.forEach((article) => {
        getLikeStatus(article.id).then((status) => {
          setLikeStatuses((prev) => ({ ...prev, [article.id]: status }));
        });
      });
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(1, true);
  }, []);

  const handleLike = async (articleId: number) => {
    if (likingIds.has(articleId)) return;
    if (likeStatuses[articleId]?.liked) return;

    setLikingIds((prev) => new Set(prev).add(articleId));
    try {
      const result = await likeArticle(articleId);
      setLikeStatuses((prev) => ({ ...prev, [articleId]: result }));
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, likeCount: result.likeCount } : a
        )
      );
    } catch (error) {
      console.error('点赞失败:', error);
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const words = content.length;
    const minutes = Math.ceil(words / 300);
    return `${minutes} 分钟阅读`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            博客
          </Link>
          <Link
            to="/login"
            className="text-gray-400 hover:text-[#ff6b35] transition-colors p-2"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {articles.map((article, index) => {
            const likeStatus = likeStatuses[article.id];
            const isLiking = likingIds.has(article.id);

            return (
              <article
                key={article.id}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/article/${article.id}`} className="block">
                  {article.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                      style={{
                        backgroundColor: `${article.category.color}20`,
                        color: article.category.color,
                      }}
                    >
                      {article.category.name}
                    </span>
                  )}

                  <h2
                    className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-[#ff6b35] transition-colors duration-200 group-hover:translate-y-[-2px]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {article.title}
                  </h2>

                  <p className="text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                    <span>·</span>
                    <span>{getReadingTime(article.content)}</span>
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      <TagIcon size={14} className="text-gray-500" />
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLike(article.id);
                    }}
                    disabled={isLiking || likeStatus?.liked}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      likeStatus?.liked
                        ? 'text-[#ff6b35]'
                        : 'text-gray-400 hover:text-[#ff6b35]'
                    } disabled:cursor-not-allowed`}
                  >
                    <Heart
                      size={18}
                      className={`transition-all duration-200 ${
                        likeStatus?.liked ? 'fill-current scale-110' : ''
                      } ${isLiking ? 'animate-bounce' : ''}`}
                    />
                    <span className="text-sm">
                      {likeStatus?.likeCount ?? article.likeCount}
                    </span>
                  </button>

                  <Link
                    to={`/article/${article.id}`}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#ff6b35] transition-colors"
                  >
                    <span>阅读全文</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#ff6b35]" size={32} />
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center py-12">
            <button
              onClick={() => loadArticles(page + 1)}
              className="px-6 py-3 border border-white/10 text-gray-300 hover:border-[#ff6b35] hover:text-[#ff6b35] rounded-lg transition-all duration-200"
            >
              加载更多
            </button>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">暂无文章</p>
            <p className="text-sm mt-2">敬请期待...</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2026 个人博客. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
