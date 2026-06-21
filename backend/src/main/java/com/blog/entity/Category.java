package com.blog.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Category {
    private Long id;
    private String name;
    private String color;
    private LocalDateTime createdAt;
}
