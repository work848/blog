import { useState, useEffect } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/category';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/api/tag';
import type { Category, Tag } from '@/types';
import { Edit2, Trash2, Plus, X, Check } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-96 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

const presetColors = [
  '#ff6b35',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
];

export default function CategoryTag() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ff6b35');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('');

  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState('');

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'tag' | null;
    item: Category | Tag | null;
  }>({
    isOpen: false,
    type: null,
    item: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
      setNewCategoryName('');
      setNewCategoryColor('#ff6b35');
      fetchData();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    try {
      await updateCategory(editingCategory.id, {
        name: editCategoryName.trim(),
        color: editCategoryColor,
      });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteModal.item?.id) return;
    try {
      await deleteCategory(deleteModal.item.id);
      setDeleteModal({ isOpen: false, type: null, item: null });
      fetchData();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await createTag({ name: newTagName.trim() });
      setNewTagName('');
      fetchData();
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editTagName.trim()) return;
    try {
      await updateTag(editingTag.id, { name: editTagName.trim() });
      setEditingTag(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteModal.item?.id) return;
    try {
      await deleteTag(deleteModal.item.id);
      setDeleteModal({ isOpen: false, type: null, item: null });
      fetchData();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const openDeleteModal = (type: 'category' | 'tag', item: Category | Tag) => {
    setDeleteModal({
      isOpen: true,
      type,
      item,
    });
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color);
  };

  const startEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <h1 className="text-3xl font-bold text-white mb-8">分类与标签管理</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-[#ff6b35]" />
            分类管理
          </h2>

          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              添加新分类
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35]/50 transition-all"
              />
              <div>
                <label className="text-xs text-gray-500 mb-2 block">
                  选择颜色
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        boxShadow:
                          newCategoryColor === color
                            ? `0 0 0 2px #121212, 0 0 0 4px ${color}`
                            : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-gray-400 text-sm">
                    {newCategoryColor}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Plus size={18} />
                添加分类
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                暂无分类
              </div>
            ) : (
              categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
              >
                {editingCategory?.id === category.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: editCategoryColor }}
                    />
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                      className="flex-1 px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded text-white focus:outline-none focus:border-[#ff6b35]/50"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditCategoryColor(color)}
                          className="w-5 h-5 rounded-full transition-all hover:scale-110"
                          style={{
                            backgroundColor: color,
                            boxShadow:
                              editCategoryColor === color
                                ? `0 0 0 2px #121212, 0 0 0 3px ${color}`
                                : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleUpdateCategory}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white">{category.name}</span>
                        <span className="text-xs text-gray-500">
                          {category.articleCount} 篇文章
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="p-2 text-gray-400 hover:text-[#ff6b35] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal('category', category)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
              </div>
            ))
            )}
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
            标签管理
          </h2>

          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              添加新标签
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="标签名称"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35]/50 transition-all"
              />
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Plus size={18} />
                添加标签
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tags.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                暂无标签
              </div>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
                >
                  {editingTag?.id === tag.id ? (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="text"
                        value={editTagName}
                        onChange={(e) => setEditTagName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateTag()}
                        className="flex-1 px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded text-white focus:outline-none focus:border-[#ff6b35]/50"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateTag}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-white">{tag.name}</span>
                        <span className="text-xs text-gray-500">
                          {tag.articleCount} 篇文章
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditTag(tag)}
                          className="p-2 text-gray-400 hover:text-[#ff6b35] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal('tag', tag)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title={`删除${deleteModal.type === 'category' ? '分类' : '标签'}`}
        message={`确定要删除"${deleteModal.item?.name}"吗？此操作不可撤销。`}
        onConfirm={
          deleteModal.type === 'category'
            ? handleDeleteCategory
            : handleDeleteTag
        }
        onCancel={() =>
          setDeleteModal({ isOpen: false, type: null, item: null })
        }
      />
    </div>
  );
}
