package com.blog.dto;

import lombok.Data;

@Data
public class StatsTrendVO {
    private String date;
    private Long totalArticles;
    private Long publishedArticles;
    private Long likeCount;
}
