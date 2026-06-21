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
} from 'lucide-react';
import { getArticleById, getLikeStatus, likeArticle } from '@/api/article';
import type { Article, LikeResponse } from '@/types';

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
    return `${minutes} 分钟阅读`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ff6b35]" size={40} />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回首页</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="animate-fade-in">
          <div className="mb-8">
            {article.category && (
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: `${article.category.color}20`,
                  color: article.category.color,
                }}
              >
                {article.category.name}
              </span>
            )}

            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-6 text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {article.title}
            </h1>

            <div className="flex items-center justify-center gap-6 text-gray-400 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{getReadingTime(article.content)}</span>
              </div>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                <TagIcon size={16} className="text-gray-500" />
                <div className="flex flex-wrap gap-2 justify-center">
                  {article.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mt-12 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mt-10 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-white mt-8 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[#f5f0e6] leading-relaxed my-6 text-lg">
                      {children}
                    </p>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-[#ff6b35] hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-[#f5f0e6] my-6 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-[#f5f0e6] my-6 space-y-2">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#ff6b35] pl-6 my-8 text-gray-300 italic">
                      {children}
                    </blockquote>
                  ),
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (match) {
                      return (
                        <div className="my-6 rounded-lg overflow-hidden">
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              background: '#0d0d0d',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-white/10 text-[#ff6b35] px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt} className="rounded-lg my-8 max-w-full" />
                  ),
                  hr: () => <hr className="border-white/10 my-12" />,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-white/10 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-white/5 px-4 py-3 text-left text-white font-medium border border-white/10">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 border border-white/10 text-[#f5f0e6]">
                      {children}
                    </td>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleLike}
                disabled={liking || likeStatus?.liked}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                  likeStatus?.liked
                    ? 'bg-[#ff6b35]/20 text-[#ff6b35]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                } disabled:cursor-not-allowed`}
              >
                <Heart
                  size={24}
                  className={`transition-all duration-200 ${
                    likeStatus?.liked ? 'fill-current scale-110' : ''
                  } ${liking ? 'animate-bounce' : ''}`}
                />
                <span className="text-lg font-medium">
                  {likeStatus?.liked ? '已点赞' : '点赞'}
                </span>
                <span className="text-gray-400">
                  {likeStatus?.likeCount ?? article.likeCount}
                </span>
              </button>
            </div>
          </div>
        </article>
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
