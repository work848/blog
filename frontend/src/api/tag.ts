import { request } from './client';
import type { Tag } from '@/types';

export const getTags = (): Promise<Tag[]> => {
  return request<Tag[]>({
    method: 'GET',
    url: '/admin/tags',
  });
};

export const createTag = (data: Partial<Tag>): Promise<Tag> => {
  return request<Tag>({
    method: 'POST',
    url: '/admin/tags',
    data,
  });
};

export const updateTag = (
  id: number,
  data: Partial<Tag>
): Promise<Tag> => {
  return request<Tag>({
    method: 'PUT',
    url: `/admin/tags/${id}`,
    data,
  });
};

export const deleteTag = (id: number): Promise<void> => {
  return request<void>({
    method: 'DELETE',
    url: `/admin/tags/${id}`,
  });
};
