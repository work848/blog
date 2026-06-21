package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.ApiResponse;
import com.blog.dto.ForgotPasswordRequest;
import com.blog.dto.LoginRequest;
import com.blog.dto.LoginResponse;
import com.blog.dto.SendEmailCodeRequest;
import com.blog.service.AuthService;
import com.blog.service.EmailService;
import com.blog.service.UserService;
import com.blog.service.VerificationTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private VerificationTokenService verificationTokenService;

    @PostMapping("/login")
    @RateLimit(value = 10.0, key = "login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/forgot-password/send-code")
    @RateLimit(value = 5.0, key = "send_forgot_password_code")
    public ApiResponse<Void> sendForgotPasswordCode(@Valid @RequestBody SendEmailCodeRequest request) {
        userService.checkEmailExists(request.getEmail());
        String code = emailService.generateVerificationCode();
        verificationTokenService.saveCode(request.getEmail(), VerificationTokenService.TYPE_FORGOT_PASSWORD, code);
        emailService.sendForgotPasswordCode(request.getEmail(), code);
        return ApiResponse.success();
    }

    @PostMapping("/forgot-password/reset")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.resetPasswordByEmail(request.getEmail(), request.getCode(), request.getNewPassword());
        return ApiResponse.success();
    }
}
