package com.blog.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LikeRecord {
    private Long id;
    private Long articleId;
    private String ipAddress;
    private LocalDateTime createdAt;
}
