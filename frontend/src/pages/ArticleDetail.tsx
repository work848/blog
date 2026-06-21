import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft,
  Heart,
  Calendar,
  Clock,
  Tag as TagIcon,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { getArticleById, getLikeStatus, likeArticle } from '@/api/article';
import type { Article, LikeResponse } from '@/types';
import ParticleBackground from '@/components/ParticleBackground';
import VerticalSidebar from '@/components/VerticalSidebar';
import HankoAvatar from '@/components/HankoAvatar';
import { resolveImageUrl } from '@/lib/utils';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeStatus, setLikeStatus] = useState<LikeResponse | null>(null);
  const [liking, setLiking] = useState(false);

  const articleId = Number(id);

  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const [articleData, likeData] = await Promise.all([
          getArticleById(articleId),
          getLikeStatus(articleId),
        ]);
        setArticle(articleData);
        setLikeStatus(likeData);
      } catch (error) {
        console.error('加载文章失败:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, navigate]);

  const handleLike = async () => {
    if (liking || likeStatus?.liked || !article) return;

    setLiking(true);
    try {
      const result = await likeArticle(article.id);
      setLikeStatus(result);
      setArticle((prev) =>
        prev ? { ...prev, likeCount: result.likeCount } : null
      );
    } catch (error) {
      console.error('点赞失败:', error);
    } finally {
      setLiking(false);
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
    return `${minutes} 分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aiiro-deep flex items-center justify-center">
        <ParticleBackground />
        <Loader2 className="animate-spin text-aiiro-accent" size={48} />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-aiiro-deep relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0" />
      <VerticalSidebar />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 bg-aiiro-deep/70 backdrop-blur-xl border-b border-aiiro-border/50">
          <div className="max-w-4xl mx-auto px-6 lg:pr-24 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-aiiro-muted hover:text-aiiro-accent transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">返回列表</span>
            </Link>

            <div className="flex items-center gap-3">
              <HankoAvatar size="sm" text="藍" />
              <span className="hidden sm:block">
                <span
                  className="text-xs tracking-[0.25em] text-aiiro-muted uppercase"
                >
                  AIIRO
                </span>
              </span>
            </div>
          </div>
        </header>

        <main className="px-6 lg:pr-24 py-12 md:py-20">
          <article className="max-w-3xl mx-auto animate-fade-in-up">
            <header className="mb-12 md:mb-20 text-center">
              <div className="flex justify-center mb-6">
                <HankoAvatar size="lg" text="印" />
              </div>

              {article.category && (
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-8 glass-card"
                  style={{
                    color: '#3A86FF',
                    border: '1px solid rgba(58, 134, 255, 0.3)',
                  }}
                >
                  {article.category.name}
                </span>
              )}

              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
                style={{
                  fontFamily: "'Playfair Display', 'Noto Serif JP', serif",
                }}
              >
                {article.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-aiiro-muted text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar size={15} />
                  <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
                <div className="w-px h-4 bg-aiiro-border" />
                <div className="flex items-center gap-2">
                  <Clock size={15} />
                  <span>{getReadingTime(article.content)}</span>
                </div>
                <div className="w-px h-4 bg-aiiro-border" />
                <div className="flex items-center gap-2">
                  <span className="font-serif-display italic">
                    #{String(article.id).padStart(3, '0')}
                  </span>
                </div>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                  <TagIcon size={15} className="text-aiiro-muted flex-shrink-0" />
                  <div className="flex flex-wrap gap-2 justify-center">
                    {article.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs text-aiiro-muted bg-aiiro-surface/50 px-3 py-1 rounded-full border border-aiiro-border/50"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </header>

            <div className="relative">
              <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-aiiro-accent/30 to-transparent hidden md:block" />

              <div className="prose-aiiro max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1
                        className="font-serif-display"
                        style={{
                          fontFamily: "'Playfair Display', 'Noto Serif JP', serif",
                        }}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2
                        className="font-serif-display"
                        style={{
                          fontFamily: "'Playfair Display', 'Noto Serif JP', serif",
                        }}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        className="font-serif-display"
                        style={{
                          fontFamily: "'Playfair Display', 'Noto Serif JP', serif",
                        }}
                      >
                        {children}
                      </h3>
                    ),
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      if (match) {
                        return (
                          <div className="my-6 rounded-xl overflow-hidden border border-aiiro-border/50">
                            <div className="flex items-center justify-between px-4 py-2 bg-aiiro-surface/50 border-b border-aiiro-border/50">
                              <span className="text-xs text-aiiro-muted font-mono">
                                {match[1]}
                              </span>
                              <span className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-aiiro-border" />
                                <span className="w-3 h-3 rounded-full bg-aiiro-border" />
                                <span className="w-3 h-3 rounded-full bg-aiiro-border" />
                              </span>
                            </div>
                            <SyntaxHighlighter
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              style={oneDark as any}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                background: '#0B1325',
                                margin: 0,
                                padding: '1rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.7',
                              }}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className="" {...props}>
                          {children}
                        </code>
                      );
                    },
                    img: ({ src, alt }) => (
                      <span className="block my-8">
                        <img
                          src={resolveImageUrl(src as string)}
                          alt={alt}
                          className="rounded-xl max-w-full mx-auto border border-aiiro-border/50"
                          loading="lazy"
                        />
                        {alt && (
                          <span className="block text-center text-xs text-aiiro-muted mt-3">
                            {alt}
                          </span>
                        )}
                      </span>
                    ),
                    p: ({ children }) => (
                      <p className="text-aiiro-light leading-relaxed mb-6 text-[1.05rem]">
                        {children}
                      </p>
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-aiiro-border/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <button
                  onClick={handleLike}
                  disabled={liking || likeStatus?.liked}
                  className={`group flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 ${
                    likeStatus?.liked
                      ? 'bg-aiiro-accent/20 text-aiiro-accent border border-aiiro-accent/30'
                      : 'glass-card text-aiiro-light hover:text-aiiro-accent'
                  } disabled:cursor-not-allowed`}
                >
                  <Heart
                    size={22}
                    className={`transition-all duration-300 ${
                      likeStatus?.liked ? 'fill-current scale-110' : ''
                    } ${liking ? 'animate-bounce' : ''} ${
                      !likeStatus?.liked ? 'group-hover:scale-110' : ''
                    }`}
                  />
                  <span>{likeStatus?.liked ? '已点赞' : '点赞'}</span>
                  <span className="text-aiiro-muted/80 tabular-nums pl-3 border-l border-aiiro-border/50">
                    {likeStatus?.likeCount ?? article.likeCount}
                  </span>
                </button>

                <Link
                  to="/"
                  className="flex items-center gap-2 text-aiiro-muted hover:text-aiiro-accent transition-colors group"
                >
                  <span className="text-sm">浏览更多文章</span>
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </article>
        </main>

        <footer className="border-t border-aiiro-border/50 py-10 px-6 lg:pr-24 mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HankoAvatar size="sm" text="印" />
              <span
                className="font-serif-display text-lg font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                蓝染博客
              </span>
            </div>
            <p className="text-sm text-aiiro-muted">
              一期一会 · 每一次相遇都是独一无二的
            </p>
            <p className="text-xs text-aiiro-muted/60 mt-3">
              © 2026 All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
