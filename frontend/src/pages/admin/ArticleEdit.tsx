import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Upload,
  Save,
  Send,
  ArrowLeft,
  Loader2,
  FileText,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  uploadFile,
  uploadImage,
  getAdminArticleById,
  createArticle,
  updateArticle,
} from '@/api/article';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import type { Category, Tag, Article } from '@/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = id ? Number(id) : null;
  const isEditMode = !!articleId;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);

        if (isEditMode && articleId) {
          const article = await getAdminArticleById(articleId);
          setTitle(article.title);
          setContent(article.content);
          setCategoryId(article.categoryId);
          setSelectedTagIds(article.tags.map((tag) => tag.id));
        }
      } catch (err) {
        console.error('加载数据失败:', err);
        setError('加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditMode, articleId]);

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        setContent((prev) => prev + text);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = before + text + after;
      setContent(newContent);

      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = start + text.length;
        textarea.setSelectionRange(newPos, newPos);
      });
    },
    [content]
  );

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('不支持的图片格式，仅支持 JPG/PNG/GIF/WEBP/BMP');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setIsImageUploading(true);
    setError('');

    try {
      const result = await uploadImage(file);
      const markdown = `\n![${file.name}](${result.url})\n`;
      insertAtCursor(markdown);
    } catch (err) {
      console.error('图片上传失败:', err);
      setError('图片上传失败，请重试');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
      e.target.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];

      if (file.type.startsWith('image/')) {
        await handleImageUpload(file);
        return;
      }

      if (!file.name.endsWith('.txt')) {
        setError('请上传 .txt 格式的文件或图片文件');
        return;
      }

      setIsUploading(true);
      setError('');

      try {
        const result = await uploadFile(file);
        setTitle(result.title);
        setContent(result.content);
      } catch (err) {
        console.error('上传文件失败:', err);
        setError('上传文件失败，请重试');
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('请上传 .txt 格式的文件');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const result = await uploadFile(file);
      setTitle(result.title);
      setContent(result.content);
    } catch (err) {
      console.error('上传文件失败:', err);
      setError('上传文件失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }
    if (!categoryId) {
      setError('请选择文章分类');
      return;
    }
    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }

    const data = {
      title: title.trim(),
      content: content.trim(),
      categoryId: Number(categoryId),
      tagIds: selectedTagIds,
      status,
    };

    if (status === 'DRAFT') {
      setIsSaving(true);
    } else {
      setIsPublishing(true);
    }
    setError('');

    try {
      if (isEditMode && articleId) {
        await updateArticle(articleId, data);
      } else {
        await createArticle(data);
      }
      navigate('/admin/articles');
    } catch (err) {
      console.error('保存文章失败:', err);
      setError('保存文章失败，请重试');
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  const summary = content.replace(/[#*`\[\]\n]/g, '').slice(0, 150);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ff6b35]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/articles"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回文章列表</span>
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <h1 className="text-xl font-bold text-white">
              {isEditMode ? '编辑文章' : '新建文章'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              <span>保存草稿</span>
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ff6b35] hover:bg-[#ff8535] text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              <span>直接发布</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-300"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div
          className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-[#ff6b35] bg-[#ff6b35]/5'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".txt"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileInput}
            className="hidden"
            id="image-upload"
          />
          <div className="flex flex-col items-center gap-3">
            {isUploading || isImageUploading ? (
              <Loader2 className="animate-spin text-[#ff6b35]" size={40} />
            ) : (
              <Upload
                className={`transition-colors ${
                  isDragOver ? 'text-[#ff6b35]' : 'text-gray-400'
                }`}
                size={40}
              />
            )}
            <div>
              <p className="text-lg font-medium text-white">
                {isUploading
                  ? '正在解析文件...'
                  : isImageUploading
                  ? '正在上传图片...'
                  : isDragOver
                  ? '松开鼠标上传文件'
                  : '拖拽文件到此处上传'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                支持 .txt 文本文件（自动解析标题和内容）和图片文件
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
              >
                <FileText size={16} />
                上传 TXT 文件
              </label>
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 border border-[#ff6b35]/30 rounded-lg text-sm text-[#ff6b35] hover:text-[#ff8535] transition-all"
              >
                <ImageIcon size={16} />
                上传图片
              </label>
            </div>
            {!isUploading && !isImageUploading && (
              <div className="text-xs text-gray-500 mt-1">
                图片支持 JPG/PNG/GIF/WEBP/BMP，最大 5MB
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                文章标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入文章标题"
                className="w-full px-4 py-3 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                文章分类
              </label>
              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full px-4 py-3 bg-[#121212] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all"
              >
                <option value="">请选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                文章标签
              </label>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-[#ff6b35]/20 border-[#ff6b35] text-[#ff6b35]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-[#ff6b35] border-[#ff6b35]'
                          : 'border-gray-500'
                      }`}
                    >
                      {selectedTagIds.includes(tag.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  文章内容 (Markdown)
                </label>
                <label
                  htmlFor="image-inline-upload"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs text-gray-400 hover:text-white transition-all"
                >
                  <ImageIcon size={14} />
                  插入图片
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileInput}
                  className="hidden"
                  id="image-inline-upload"
                />
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入文章内容，支持 Markdown 语法..."
                rows={20}
                className="w-full px-4 py-3 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all resize-none font-mono text-sm leading-relaxed"
              />
              {isImageUploading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#ff6b35]">
                  <Loader2 className="animate-spin" size={14} />
                  图片上传中...
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#121212] rounded-xl border border-white/10 p-6 overflow-auto max-h-[calc(100vh-220px)]">
            <div className="text-sm text-gray-400 mb-4 pb-3 border-b border-white/10">
              实时预览
            </div>
            <div className="prose prose-invert max-w-none">
              {title && (
                <h1
                  className="text-3xl font-bold text-white mb-6"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {title}
                </h1>
              )}
              {summary && (
                <p className="text-gray-400 text-sm italic mb-6 pb-6 border-b border-white/10">
                  {summary}...
                </p>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1
                      className="text-2xl font-bold text-white mt-8 mb-4"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      className="text-xl font-bold text-white mt-6 mb-3"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      className="text-lg font-semibold text-white mt-5 mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[#f5f0e6] leading-relaxed my-4">
                      {children}
                    </p>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-[#ff6b35] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-[#f5f0e6] my-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-[#f5f0e6] my-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#ff6b35] pl-4 my-6 text-gray-300 italic">
                      {children}
                    </blockquote>
                  ),
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (match) {
                      return (
                        <div className="my-4 rounded-lg overflow-hidden">
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
                      <code
                        className="bg-white/10 text-[#ff6b35] px-1.5 py-0.5 rounded text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="rounded-lg my-6 max-w-full"
                    />
                  ),
                  hr: () => <hr className="border-white/10 my-8" />,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-white/10 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-white/5 px-4 py-2 text-left text-white font-medium border border-white/10">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border border-white/10 text-[#f5f0e6]">
                      {children}
                    </td>
                  ),
                }}
              >
                {content || '*开始编写内容，预览将显示在这里...*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
