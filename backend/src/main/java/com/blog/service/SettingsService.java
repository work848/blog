package com.blog.service;

import com.blog.dto.FontSettingsVO;
import com.blog.entity.Settings;
import com.blog.mapper.SettingsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    public static final String KEY_FONT_FAMILY = "global_font_family";
    public static final String KEY_FONT_SIZE = "global_font_size";

    public static final String DEFAULT_FONT_FAMILY = "system-ui, -apple-system, sans-serif";
    public static final String DEFAULT_FONT_SIZE = "16";

    @Autowired
    private SettingsMapper settingsMapper;

    public FontSettingsVO getFontSettings() {
        Settings fontFamilySetting = settingsMapper.findByKey(KEY_FONT_FAMILY);
        Settings fontSizeSetting = settingsMapper.findByKey(KEY_FONT_SIZE);

        String fontFamily = (fontFamilySetting != null && fontFamilySetting.getSettingValue() != null)
                ? fontFamilySetting.getSettingValue() : DEFAULT_FONT_FAMILY;
        String fontSize = (fontSizeSetting != null && fontSizeSetting.getSettingValue() != null)
                ? fontSizeSetting.getSettingValue() : DEFAULT_FONT_SIZE;

        return new FontSettingsVO(fontFamily, fontSize);
    }

    @Transactional
    public FontSettingsVO updateFontSettings(FontSettingsVO request) {
        if (request.getFontFamily() != null && !request.getFontFamily().isBlank()) {
            settingsMapper.insertOrUpdate(KEY_FONT_FAMILY, request.getFontFamily(), "全局字体设置");
        }
        if (request.getFontSize() != null && !request.getFontSize().isBlank()) {
            try {
                int size = Integer.parseInt(request.getFontSize());
                if (size < 10 || size > 48) {
                    throw new IllegalArgumentException("字体大小必须在10-48px之间");
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("字体大小必须是有效数字");
            }
            settingsMapper.insertOrUpdate(KEY_FONT_SIZE, request.getFontSize(), "全局字体大小(px)");
        }
        return getFontSettings();
    }
}
