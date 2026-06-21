package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.ApiResponse;
import com.blog.dto.LoginRequest;
import com.blog.dto.LoginResponse;
import com.blog.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @RateLimit(value = 10.0, key = "login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success(response);
    }
}
