package com.blog.dto;

import lombok.Data;

@Data
public class CategoryVO {
    private Long id;
    private String name;
    private String color;
    private Integer articleCount;
}
