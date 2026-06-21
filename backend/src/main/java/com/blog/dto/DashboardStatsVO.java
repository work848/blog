package com.blog.dto;

import lombok.Data;

@Data
public class DashboardStatsVO {
    private Long totalArticles;
    private Long publishedArticles;
    private Long draftArticles;
    private Integer totalLikes;
}
