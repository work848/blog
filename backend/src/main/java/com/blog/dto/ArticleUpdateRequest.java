package com.blog.dto;

import lombok.Data;
import java.util.List;

@Data
public class ArticleUpdateRequest {
    private String title;
    private String content;
    private String summary;
    private Long categoryId;
    private List<Long> tagIds;
    private String status;
}
