export interface User {
  id: number;
  username: string;
  role: 'ADMIN';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  articleCount: number;
}

export interface Tag {
  id: number;
  name: string;
  articleCount: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  status: 'DRAFT' | 'PUBLISHED';
  categoryId: number;
  category?: Category;
  tags: Tag[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  summary?: string;
  categoryId: number;
  tagIds: number[];
  status: 'DRAFT' | 'PUBLISHED';
}

export interface ArticleUpdateRequest {
  title?: string;
  content?: string;
  summary?: string;
  categoryId?: number;
  tagIds?: number[];
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export interface FileUploadResponse {
  title: string;
  content: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface BatchPublishRequest {
  articleIds: number[];
}

export interface BatchDeleteRequest {
  articleIds: number[];
}
