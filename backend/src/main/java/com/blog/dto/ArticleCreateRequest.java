package com.blog.dto;

import lombok.Data;
import java.util.List;

@Data
public class ArticleCreateRequest {
    private String title;
    private String content;
    private String summary;
    private Long categoryId;
    private List<Long> tagIds;
    private String status;
}
