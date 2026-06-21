package com.blog.controller;

import com.blog.dto.ApiResponse;
import com.blog.dto.FontSettingsVO;
import com.blog.dto.UpdateFontSettingsRequest;
import com.blog.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping("/font")
    public ApiResponse<FontSettingsVO> getFontSettings() {
        FontSettingsVO settings = settingsService.getFontSettings();
        return ApiResponse.success(settings);
    }

    @PutMapping("/font")
    public ApiResponse<FontSettingsVO> updateFontSettings(@RequestBody UpdateFontSettingsRequest request) {
        FontSettingsVO vo = new FontSettingsVO(request.getFontFamily(), request.getFontSize());
        FontSettingsVO updated = settingsService.updateFontSettings(vo);
        return ApiResponse.success(updated);
    }
}
