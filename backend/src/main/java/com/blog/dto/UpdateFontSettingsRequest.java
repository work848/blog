package com.blog.dto;

import lombok.Data;

@Data
public class UpdateFontSettingsRequest {
    private String fontFamily;
    private String fontSize;
}
