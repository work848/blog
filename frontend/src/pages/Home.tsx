import { useState, useEffect } from 'react';
import { Heart, Calendar, Loader2, Tag as TagIcon } from 'lucide-react';
import { getPublishedArticles, getLikeStatus, likeArticle } from '@/api/article';
import type { Article, LikeResponse, Category } from '@/types';
import ParticleBackground from '@/components/ParticleBackground';
import ArticleCard from '@/components/ArticleCard';
import VerticalSidebar from '@/components/VerticalSidebar';
import HankoAvatar from '@/components/HankoAvatar';

const cardSpans = [
  { col: 'md:col-span-7 lg:col-span-7', row: '' },
  { col: 'md:col-span-5 lg:col-span-5', row: 'md:row-span-2' },
  { col: 'md:col-span-4 lg:col-span-4', row: '' },
  { col: 'md:col-span-4 lg:col-span-4', row: '' },
  { col: 'md:col-span-4 lg:col-span-4', row: '' },
  { col: 'md:col-span-6 lg:col-span-6', row: '' },
  { col: 'md:col-span-6 lg:col-span-6', row: '' },
  { col: 'md:col-span-4 lg:col-span-4', row: '' },
  { col: 'md:col-span-8 lg:col-span-8', row: '' },
  { col: 'md:col-span-4 lg:col-span-4', row: '' },
  { col: 'md:col-span-5 lg:col-span-5', row: '' },
  { col: 'md:col-span-7 lg:col-span-7', row: '' },
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likeStatuses, setLikeStatuses] = useState<Record<number, LikeResponse>>({});
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);

  const loadArticles = async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const result = await getPublishedArticles(pageNum, 12);
      if (reset) {
        setArticles(result.list);
      } else {
        setArticles((prev) => [...prev, ...result.list]);
      }
      setHasMore(pageNum * 12 < result.total);
      setPage(pageNum);

      const uniqueCats = new Map<number, Category>();
      result.list.forEach((article) => {
        if (article.category) {
          if (!uniqueCats.has(article.category.id)) {
            uniqueCats.set(article.category.id, article.category);
          }
        }
        getLikeStatus(article.id).then((status) => {
          setLikeStatuses((prev) => ({ ...prev, [article.id]: status }));
        });
      });
      setCategories(Array.from(uniqueCats.values()));
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

  return (
    <div className="min-h-screen bg-aiiro-deep relative overflow-hidden">
      <ParticleBackground />

      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0" />

      <VerticalSidebar categories={categories} />

      <div className="relative z-10">
        <header className="relative pt-16 pb-8 md:pt-24 md:pb-16 px-6 lg:pr-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
              <div className="relative">
                <div className="absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-aiiro-accent/40 to-transparent hidden md:block" />

                <div className="flex items-center gap-4 mb-6">
                  <HankoAvatar size="md" text="蓝" />
                  <div>
                    <p className="text-xs tracking-[0.3em] text-aiiro-muted uppercase font-sans">
                      AIIRO · 蓝染
                    </p>
                    <p className="text-sm text-aiiro-muted/70 mt-0.5">
                      墨染成文，青出于蓝
                    </p>
                  </div>
                </div>

                <h1
                  className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                  style={{ fontFamily: "'Playfair Display', 'Noto Serif JP', serif" }}
                >
                  <span className="block">Thoughts,</span>
                  <span className="block italic text-gradient">rendered in</span>
                  <span className="block">
                    <span
                      className="font-serif-jp"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      藍
                    </span>
                    <span className="text-aiiro-muted">.</span>
                  </span>
                </h1>

                <p className="text-aiiro-muted text-base md:text-lg max-w-lg leading-relaxed font-light">
                  在深蓝的静谧中，书写代码与生活的沉思。
                  每一篇文字都是一次思维的沉淀，如同蓝染布上缓缓晕开的墨色。
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-white font-serif-display">
                      {articles.length}
                    </span>
                    <span className="text-xs text-aiiro-muted tracking-wider">
                      篇文章
                    </span>
                  </div>
                  <div className="w-px h-10 bg-aiiro-border" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-aiiro-accent font-serif-display">
                      {articles.reduce((sum, a) => sum + a.likeCount, 0)}
                    </span>
                    <span className="text-xs text-aiiro-muted tracking-wider">
                      次点赞
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-aiiro-muted">
                  <Calendar size={14} />
                  <span>
                    最后更新:{' '}
                    {articles[0]
                      ? formatDate(articles[0].publishedAt || articles[0].createdAt)
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3" id="tags">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-4 py-1.5 rounded-full text-sm glass-card text-aiiro-light hover:text-aiiro-accent transition-colors cursor-pointer"
                >
                  <TagIcon size={12} className="inline mr-1.5 -mt-0.5" />
                  {cat.name}
                  <span className="ml-1.5 text-aiiro-muted/60 text-xs tabular-nums">
                    {cat.articleCount}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-aiiro-border to-transparent" />

        <main className="px-6 lg:pr-24 py-16" id="articles">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <h2
                className="font-serif-display text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', 'Noto Serif JP', serif" }}
              >
                最新文章
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-aiiro-border/60 to-transparent" />
              <span className="text-xs text-aiiro-muted tracking-widest font-serif-display italic">
                Latest Posts
              </span>
            </div>

            {articles.length > 0 ? (
              <div className="tatami-grid">
                {articles.map((article, index) => {
                  const span = cardSpans[index % cardSpans.length];
                  return (
                    <div key={article.id} className={span.col}>
                      <ArticleCard
                        article={article}
                        index={index}
                        likeStatus={likeStatuses[article.id]}
                        isLiking={likingIds.has(article.id)}
                        onLike={handleLike}
                        span={span}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-24">
                  <div className="text-6xl mb-6 opacity-20">
                    <span
                      className="font-serif-jp"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      無
                    </span>
                  </div>
                  <p className="text-aiiro-muted text-lg">
                    暂无文章
                  </p>
                  <p className="text-aiiro-muted/60 text-sm mt-2">敬请期待...</p>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-aiiro-accent" size={36} />
              </div>
            )}

            {!loading && hasMore && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={() => loadArticles(page + 1)}
                  className="group glass-card px-8 py-4 rounded-xl text-aiiro-light hover:text-aiiro-accent transition-all duration-300 flex items-center gap-3"
                >
                  <span>加载更多</span>
                  <Heart
                    size={16}
                    className="group-hover:text-aiiro-accent transition-colors"
                  />
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="relative border-t border-aiiro-border/50 py-12 px-6 lg:pr-24" id="about">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex items-center gap-4">
                <HankoAvatar size="sm" text="印" />
                <div>
                  <p
                    className="font-serif-display text-xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    蓝染博客
                  </p>
                  <p className="text-xs text-aiiro-muted tracking-widest uppercase">
                    AIIRO BLOG · est. 2026
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <p className="text-sm text-aiiro-muted">
                  一期一会 · 每一次相遇都是独一无二的
                </p>
                <p className="text-xs text-aiiro-muted/60">
                  © 2026 All rights reserved. Crafted with indigo & intention.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
