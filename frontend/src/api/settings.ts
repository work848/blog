import { request } from './client';
import type { FontSettingsVO, UpdateFontSettingsRequest } from '@/types';

export const getFontSettings = (): Promise<FontSettingsVO> => {
  return request<FontSettingsVO>({
    method: 'GET',
    url: '/settings/font',
  });
};

export const updateFontSettings = (data: UpdateFontSettingsRequest): Promise<FontSettingsVO> => {
  return request<FontSettingsVO>({
    method: 'PUT',
    url: '/settings/font',
    data,
  });
};
