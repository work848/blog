package com.blog.dto;

import lombok.Data;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String email;
    private String avatar;
    private String role;
}
