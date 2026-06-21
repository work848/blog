import { request } from './client';
import type {
  User,
  UpdateUsernameRequest,
  UpdatePasswordRequest,
  BindEmailRequest,
  SendEmailCodeRequest,
} from '@/types';

export const getProfile = (): Promise<User> => {
  return request<User>({
    method: 'GET',
    url: '/user/profile',
  });
};

export const updateUsername = (data: UpdateUsernameRequest): Promise<User> => {
  return request<User>({
    method: 'PUT',
    url: '/user/username',
    data,
  });
};

export const updatePassword = (data: UpdatePasswordRequest): Promise<void> => {
  return request<void>({
    method: 'PUT',
    url: '/user/password',
    data,
  });
};

export const uploadAvatar = (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);
  return request<User>({
    method: 'POST',
    url: '/user/avatar',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const sendBindEmailCode = (data: SendEmailCodeRequest): Promise<void> => {
  return request<void>({
    method: 'POST',
    url: '/user/email/send-code',
    data,
  });
};

export const bindEmail = (data: BindEmailRequest): Promise<User> => {
  return request<User>({
    method: 'POST',
    url: '/user/email/bind',
    data,
  });
};
