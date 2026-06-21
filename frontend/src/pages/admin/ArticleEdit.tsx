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
import { resolveImageUrl } from '@/lib/utils';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = id ? Number(id) : null;
  const isEditMode = !!articleId;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTextAreaDragOver, setIsTextAreaDragOver] = useState(false);
  const [isInsertButtonDragOver, setIsInsertButtonDragOver] = useState(false);
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
          const len = article.content.length;
          selectionRef.current = { start: len, end: len };
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

  const syncSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      selectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
    }
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const { start, end } = selectionRef.current;
    setContent((prev) => {
      const before = prev.substring(0, start);
      const after = prev.substring(end);
      return before + text + after;
    });
    const newPos = start + text.length;
    selectionRef.current = { start: newPos, end: newPos };
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }
    });
  }, []);

  const uploadSingleImage = async (file: File): Promise<string> => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`"${file.name}" 不支持的图片格式，仅支持 JPG/PNG/GIF/WEBP/BMP`);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`"${file.name}" 图片大小不能超过 5MB`);
    }
    const result = await uploadImage(file);
    return `![${file.name}](${result.url})`;
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError('请上传图片文件');
      return;
    }

    setIsImageUploading(true);
    setError('');

    try {
      const markdownParts: string[] = [];
      for (const file of imageFiles) {
        try {
          const md = await uploadSingleImage(file);
          markdownParts.push(md);
        } catch (err: any) {
          setError(err.message || '部分图片上传失败');
        }
      }
      if (markdownParts.length > 0) {
        const combined = '\n' + markdownParts.join('\n\n') + '\n';
        insertAtCursor(combined);
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      setError('图片上传失败，请重试');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleImageFiles(files);
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

      if (!file.name.endsWith('.txt')) {
        setError('请上传 .txt 格式的文件，图片请在下方内容编辑区拖拽或点击插入');
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

  const handleTextAreaDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsTextAreaDragOver(true);
    }
  };

  const handleTextAreaDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTextAreaDragOver(false);
  };

  const getCaretPositionFromEvent = (e: React.DragEvent): number | null => {
    const textarea = textareaRef.current;
    if (!textarea) return null;
    const rect = textarea.getBoundingClientRect();
    const pointX = e.clientX;
    const pointY = e.clientY;
    if (document.caretPositionFromPoint) {
      const range: any = document.caretPositionFromPoint(pointX, pointY);
      if (range && range.offsetNode === textarea) {
        return range.offset;
      }
    }
    if ((document as any).caretRangeFromPoint) {
      const range: any = (document as any).caretRangeFromPoint(pointX, pointY);
      if (range && range.startContainer === textarea) {
        return range.startOffset;
      }
    }
    return null;
  };

  const handleTextAreaDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTextAreaDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const dropPos = getCaretPositionFromEvent(e);
    if (dropPos !== null) {
      selectionRef.current = { start: dropPos, end: dropPos };
    }

    await handleImageFiles(files);
  };

  const handleInsertButtonDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsInsertButtonDragOver(true);
    }
  };

  const handleInsertButtonDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInsertButtonDragOver(false);
  };

  const handleInsertButtonDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInsertButtonDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    await handleImageFiles(files);
  };

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
                  : isDragOver
                  ? '松开鼠标上传文件'
                  : '拖拽文件到此处上传'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                支持 .txt 文本文件（自动解析标题和内容），图片上传请使用下方内容编辑区
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
            </div>
            {!isUploading && !isImageUploading && (
              <div className="text-xs text-gray-500 mt-1">
                图片上传：支持 JPG/PNG/GIF/WEBP/BMP，最大 5MB，请在内容编辑区使用「插入图片」按钮或直接拖拽图片到编辑框
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
                  onDragOver={handleInsertButtonDragOver}
                  onDragLeave={handleInsertButtonDragLeave}
                  onDrop={handleInsertButtonDrop}
                  className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs transition-all ${
                    isInsertButtonDragOver
                      ? 'bg-[#ff6b35]/20 border-[#ff6b35] text-[#ff6b35]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ImageIcon size={14} />
                  插入图片
                  <span className="text-[10px] text-gray-500">(可多选 / 可拖拽至此)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileInput}
                  className="hidden"
                  id="image-inline-upload"
                />
              </div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onSelect={syncSelection}
                  onClick={syncSelection}
                  onKeyUp={syncSelection}
                  onDragOver={handleTextAreaDragOver}
                  onDragLeave={handleTextAreaDragLeave}
                  onDrop={handleTextAreaDrop}
                  placeholder="请输入文章内容，支持 Markdown 语法，可直接拖拽图片到此处插入..."
                  rows={20}
                  className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all resize-none font-mono text-sm leading-relaxed ${
                    isTextAreaDragOver
                      ? 'border-[#ff6b35] ring-1 ring-[#ff6b35] bg-[#ff6b35]/5'
                      : 'border-white/10 focus:border-[#ff6b35] focus:ring-[#ff6b35]'
                  }`}
                />
                {isTextAreaDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg bg-[#ff6b35]/10 border-2 border-dashed border-[#ff6b35]">
                    <div className="flex items-center gap-2 text-[#ff6b35] font-medium">
                      <ImageIcon size={20} />
                      松开鼠标插入图片到当前位置
                    </div>
                  </div>
                )}
              </div>
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
                      src={resolveImageUrl(src as string)}
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
