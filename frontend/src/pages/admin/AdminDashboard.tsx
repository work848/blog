import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  CheckCircle,
  FileEdit,
  Heart,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  getAllArticles,
  getDashboardStats,
  getStatsTrend,
} from '@/api/article';
import type { Article, DashboardStats, StatsTrend } from '@/types';

type TrendKey = 'totalArticles' | 'publishedArticles' | 'likeCount';

const LINE_CONFIG: Record<TrendKey, { label: string; color: string }> = {
  totalArticles: { label: '文章总数', color: '#3A86FF' },
  publishedArticles: { label: '发布数量', color: '#67E8F9' },
  likeCount: { label: '点赞数量', color: '#F43F5E' },
};

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

interface StatCardData {
  title: string;
  value: number;
  icon: typeof FileText;
  color: string;
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
      className={`glass-card rounded-xl p-6 transition-all duration-500 hover:shadow-neon-sm ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-aiiro-muted text-sm mb-1 font-serif-jp" style={{ fontFamily: "'Noto Serif JP', serif" }}>{data.title}</p>
          <p
            className="text-3xl font-bold text-white mt-2 font-serif-display"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {count.toLocaleString()}
          </p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${data.color}20`, border: `1px solid ${data.color}30` }}
        >
          <Icon size={24} style={{ color: data.color }} />
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 shadow-glass border border-aiiro-border">
        <p className="text-aiiro-muted text-sm mb-2">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<StatsTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleLines, setVisibleLines] = useState<Set<TrendKey>>(
    new Set(['totalArticles', 'publishedArticles', 'likeCount'])
  );
  const [trendDays, setTrendDays] = useState(14);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [articlesRes, statsRes, trendRes] = await Promise.all([
          getAllArticles(1, 5),
          getDashboardStats(),
          getStatsTrend(trendDays),
        ]);
        setArticles(articlesRes.list);
        setStats(statsRes);
        setTrend(trendRes);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [trendDays]);

  const toggleLine = (key: TrendKey) => {
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatLongDate = (dateStr: string) => {
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

  const statCards: StatCardData[] = stats
    ? [
        {
          title: '文章总数',
          value: stats.totalArticles,
          icon: FileText,
          color: '#3A86FF',
        },
        {
          title: '已发布',
          value: stats.publishedArticles,
          icon: CheckCircle,
          color: '#10B981',
        },
        {
          title: '草稿数',
          value: stats.draftArticles,
          icon: FileEdit,
          color: '#F59E0B',
        },
        {
          title: '总点赞数',
          value: stats.totalLikes,
          icon: Heart,
          color: '#F43F5E',
        },
      ]
    : [];

  const chartData = trend.map((t) => ({
    date: formatDate(t.date),
    totalArticles: t.totalArticles,
    publishedArticles: t.publishedArticles,
    likeCount: t.likeCount,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-white mb-2 font-serif-display"
          style={{ fontFamily: "'Playfair Display', 'Noto Serif JP', serif" }}
        >
          概覽
        </h1>
        <p className="text-aiiro-muted font-serif-jp" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          おかえりなさい、ブログのデータ概要です
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-aiiro-border/50 rounded w-20 mb-4" />
                <div className="h-8 bg-aiiro-border/50 rounded w-24" />
              </div>
            ))
          : statCards.map((stat, index) => (
              <StatCard key={stat.title} data={stat} index={index} />
            ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2
            className="text-xl font-bold text-white font-serif-display"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            データ傾向
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={trendDays}
              onChange={(e) => setTrendDays(Number(e.target.value))}
              className="px-3 py-2 bg-aiiro-deep/50 border border-aiiro-border rounded-lg text-white text-sm focus:outline-none focus:border-aiiro-accent"
            >
              <option value={7}>最近 7 日</option>
              <option value={14}>最近 14 日</option>
              <option value={30}>最近 30 日</option>
            </select>
            {(Object.keys(LINE_CONFIG) as TrendKey[]).map((key) => {
              const cfg = LINE_CONFIG[key];
              const active = visibleLines.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleLine(key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    active
                      ? 'bg-aiiro-accent/15 border-aiiro-accent/40 text-aiiro-light'
                      : 'bg-transparent border-aiiro-border/50 text-aiiro-muted hover:text-aiiro-light'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: active ? cfg.color : 'transparent',
                      border: `2px solid ${cfg.color}`,
                      opacity: active ? 1 : 0.4,
                    }}
                  />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex justify-center items-center">
            <Loader2 className="animate-spin text-aiiro-accent" size={32} />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {(Object.keys(LINE_CONFIG) as TrendKey[]).map((key) => (
                    <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={LINE_CONFIG[key].color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={LINE_CONFIG[key].color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(30,41,59,0.8)' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(30,41,59,0.8)' }}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value: string) => (
                    <span className="text-aiiro-muted text-sm">{value}</span>
                  )}
                />
                {(Object.keys(LINE_CONFIG) as TrendKey[]).map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={LINE_CONFIG[key].label}
                    stroke={LINE_CONFIG[key].color}
                    strokeWidth={visibleLines.has(key) ? 2.5 : 0}
                    strokeOpacity={visibleLines.has(key) ? 1 : 0}
                    dot={visibleLines.has(key) ? { r: 3, strokeWidth: 0, fill: LINE_CONFIG[key].color } : false}
                    activeDot={visibleLines.has(key) ? { r: 5, strokeWidth: 0 } : false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold text-white font-serif-display"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            最新記事
          </h2>
          <span className="text-sm text-aiiro-muted">共 5 条</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-aiiro-accent" size={32} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-aiiro-muted">
            <p className="text-lg">記事がありません</p>
          </div>
        ) : (
          <div className="space-y-1">
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-aiiro-accent/5 transition-colors group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-aiiro-border/30 group-hover:bg-aiiro-accent/20 transition-colors">
                    <FileText
                      size={18}
                      className="text-aiiro-muted group-hover:text-aiiro-accent transition-colors"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate group-hover:text-aiiro-accent transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-aiiro-muted" />
                      <span className="text-sm text-aiiro-muted">
                        {formatLongDate(article.publishedAt || article.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {getStatusBadge(article.status)}
                  <div className="flex items-center gap-1 text-aiiro-muted">
                    <Heart size={14} />
                    <span className="text-sm tabular-nums">{article.likeCount}</span>
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
