import { useState, useEffect } from 'react';
import { FileText, CheckCircle, FileEdit, Heart, Clock, Loader2 } from 'lucide-react';
import { getAllArticles } from '@/api/article';
import type { Article } from '@/types';

interface StatCardData {
  title: string;
  value: number;
  icon: typeof FileText;
  change: number;
  color: string;
}

const mockStats: StatCardData[] = [
  {
    title: '文章总数',
    value: 128,
    icon: FileText,
    change: 12,
    color: '#ff6b35',
  },
  {
    title: '已发布',
    value: 96,
    icon: CheckCircle,
    change: 8,
    color: '#10b981',
  },
  {
    title: '草稿数',
    value: 32,
    icon: FileEdit,
    change: -5,
    color: '#f59e0b',
  },
  {
    title: '总点赞数',
    value: 2847,
    icon: Heart,
    change: 23,
    color: '#ef4444',
  },
];

function useCountUp(target: number, duration: number = 1500, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

function StatCard({ data, index }: { data: StatCardData; index: number }) {
  const [visible, setVisible] = useState(false);
  const count = useCountUp(data.value, 1500, visible);
  const Icon = data.icon;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`bg-[#121212] border border-white/10 rounded-xl p-6 transition-all duration-500 hover:border-[#ff6b35]/50 hover:transform hover:translate-y-[-4px] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{data.title}</p>
          <p
            className="text-3xl font-bold text-white mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {count.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-3">
            <span
              className={`text-sm font-medium ${
                data.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {data.change >= 0 ? '+' : ''}
              {data.change}%
            </span>
            <span className="text-gray-500 text-sm">同比上周</span>
          </div>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${data.color}20` }}
        >
          <Icon size={24} style={{ color: data.color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const result = await getAllArticles(1, 5);
        setArticles(result.list);
      } catch (error) {
        console.error('加载最新文章失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
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

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLISHED') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
          已发布
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
        草稿
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          概览
        </h1>
        <p className="text-gray-400">欢迎回来，这是您的博客数据概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <StatCard key={stat.title} data={stat} index={index} />
        ))}
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            最新文章
          </h2>
          <span className="text-sm text-gray-500">共 5 条</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#ff6b35]" size={32} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">暂无文章</p>
          </div>
        ) : (
          <div className="space-y-1">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/5 group-hover:bg-[#ff6b35]/20 transition-colors">
                    <FileText size={18} className="text-gray-400 group-hover:text-[#ff6b35] transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate group-hover:text-[#ff6b35] transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {getStatusBadge(article.status)}
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart size={14} />
                    <span className="text-sm">{article.likeCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
