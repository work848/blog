import { request } from './client';
import type { Category } from '@/types';

export const getCategories = (): Promise<Category[]> => {
  return request<Category[]>({
    method: 'GET',
    url: '/admin/categories',
  });
};

export const createCategory = (data: Partial<Category>): Promise<Category> => {
  return request<Category>({
    method: 'POST',
    url: '/admin/categories',
    data,
  });
};

export const updateCategory = (
  id: number,
  data: Partial<Category>
): Promise<Category> => {
  return request<Category>({
    method: 'PUT',
    url: `/admin/categories/${id}`,
    data,
  });
};

export const deleteCategory = (id: number): Promise<void> => {
  return request<void>({
    method: 'DELETE',
    url: `/admin/categories/${id}`,
  });
};
