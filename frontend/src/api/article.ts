import { request } from './client';
import type {
  Article,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  PageResult,
  LikeResponse,
  FileUploadResponse,
  BatchPublishRequest,
  BatchDeleteRequest,
} from '@/types';

export const getPublishedArticles = (
  page: number = 1,
  size: number = 10
): Promise<PageResult<Article>> => {
  return request<PageResult<Article>>({
    method: 'GET',
    url: '/articles',
    params: { page, size },
  });
};

export const getArticleById = (id: number): Promise<Article> => {
  return request<Article>({
    method: 'GET',
    url: `/articles/${id}`,
  });
};

export const likeArticle = (id: number): Promise<LikeResponse> => {
  return request<LikeResponse>({
    method: 'POST',
    url: `/articles/${id}/like`,
  });
};

export const getLikeStatus = (id: number): Promise<LikeResponse> => {
  return request<LikeResponse>({
    method: 'GET',
    url: `/articles/${id}/like/status`,
  });
};

export const getAllArticles = (
  page: number = 1,
  size: number = 10,
  status?: string
): Promise<PageResult<Article>> => {
  return request<PageResult<Article>>({
    method: 'GET',
    url: '/admin/articles',
    params: { page, size, status },
  });
};

export const getDrafts = (
  page: number = 1,
  size: number = 10
): Promise<PageResult<Article>> => {
  return request<PageResult<Article>>({
    method: 'GET',
    url: '/admin/articles/drafts',
    params: { page, size },
  });
};

export const getAdminArticleById = (id: number): Promise<Article> => {
  return request<Article>({
    method: 'GET',
    url: `/admin/articles/${id}`,
  });
};

export const uploadFile = (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return request<FileUploadResponse>({
    method: 'POST',
    url: '/admin/articles/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createArticle = (data: ArticleCreateRequest): Promise<Article> => {
  return request<Article>({
    method: 'POST',
    url: '/admin/articles',
    data,
  });
};

export const updateArticle = (
  id: number,
  data: ArticleUpdateRequest
): Promise<Article> => {
  return request<Article>({
    method: 'PUT',
    url: `/admin/articles/${id}`,
    data,
  });
};

export const deleteArticle = (id: number): Promise<void> => {
  return request<void>({
    method: 'DELETE',
    url: `/admin/articles/${id}`,
  });
};

export const batchPublish = (articleIds: number[]): Promise<void> => {
  return request<void>({
    method: 'POST',
    url: '/admin/articles/publish/batch',
    data: { articleIds } as BatchPublishRequest,
  });
};

export const batchDelete = (articleIds: number[]): Promise<void> => {
  return request<void>({
    method: 'DELETE',
    url: '/admin/articles/batch',
    data: { articleIds } as BatchDeleteRequest,
  });
};
