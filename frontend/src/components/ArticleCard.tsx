import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Clock, Tag as TagIcon } from 'lucide-react';
import type { Article, LikeResponse } from '@/types';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  index: number;
  likeStatus?: LikeResponse;
  isLiking: boolean;
  onLike: (articleId: number) => void;
  span?: {
    col?: string;
    row?: string;
  };
}

export default function ArticleCard({
  article,
  index,
  likeStatus,
  isLiking,
  onLike,
  span,
}: ArticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
    );
    setGlowPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
    setGlowPosition({ x: 50, y: 50 });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const words = content.length;
    const minutes = Math.ceil(words / 300);
    return `${minutes} 分钟`;
  };

  return (
    <article
      ref={cardRef}
      className={cn(
        'glass-card rounded-2xl p-6 relative overflow-hidden opacity-0 animate-fade-in-up',
        span?.col,
        span?.row
      )}
      style={{
        transform,
        transition: 'transform 0.2s ease-out',
        animationDelay: `${index * 0.08}s`,
        zIndex: 10 + (index % 5),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(58, 134, 255, 0.15) 0%, transparent 50%)`,
        }}
      />

      <Link to={`/article/${article.id}`} className="block relative z-10 h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          {article.category && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'rgba(58, 134, 255, 0.15)',
                color: '#3A86FF',
                border: '1px solid rgba(58, 134, 255, 0.3)',
              }}
            >
              {article.category.name}
            </span>
          )}

          <span className="font-serif-display text-sm text-aiiro-muted italic">
            #{String(article.id).padStart(3, '0')}
          </span>
        </div>

        <h2
          className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight hover:text-aiiro-accent transition-colors duration-300"
          style={{ fontFamily: "'Playfair Display', 'Noto Serif JP', serif" }}
        >
          {article.title}
        </h2>

        <p className="text-aiiro-muted text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
          {article.summary || article.content.slice(0, 150)}
        </p>

        <div className="flex items-center gap-4 text-xs text-aiiro-muted mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>{getReadingTime(article.content)}</span>
          </div>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <TagIcon size={12} className="text-aiiro-muted flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-aiiro-muted bg-aiiro-border/50 px-2 py-0.5 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </Link>

      <div className="relative z-10 flex items-center justify-between pt-4 mt-auto border-t border-aiiro-border/50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLike(article.id);
          }}
          disabled={isLiking || likeStatus?.liked}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-all duration-300',
            likeStatus?.liked
              ? 'text-aiiro-accent'
              : 'text-aiiro-muted hover:text-aiiro-accent'
          )}
        >
          <Heart
            size={16}
            className={cn(
              'transition-all duration-300',
              likeStatus?.liked ? 'fill-current scale-110' : '',
              isLiking ? 'animate-bounce' : ''
            )}
          />
          <span className="tabular-nums">
            {likeStatus?.likeCount ?? article.likeCount}
          </span>
        </button>

        <Link
          to={`/article/${article.id}`}
          className="text-xs text-aiiro-muted hover:text-aiiro-accent transition-colors flex items-center gap-1"
        >
          <span>阅读</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
