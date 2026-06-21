package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.*;
import com.blog.entity.User;
import com.blog.service.EmailService;
import com.blog.service.UserService;
import com.blog.service.VerificationTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VerificationTokenService verificationTokenService;

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User getCurrentUser() {
        String username = getCurrentUsername();
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        return user;
    }

    @GetMapping("/profile")
    public ApiResponse<UserVO> getProfile() {
        User user = getCurrentUser();
        return ApiResponse.success(userService.getUserVO(user));
    }

    @PutMapping("/username")
    public ApiResponse<LoginResponse> updateUsername(@Valid @RequestBody UpdateUsernameRequest request) {
        User user = getCurrentUser();
        if (user.getUsername().equals(request.getUsername())) {
            return ApiResponse.success(new LoginResponse(null, userService.getUserVO(user)));
        }
        LoginResponse response = userService.updateUsername(user.getId(), request.getUsername());
        return ApiResponse.success(response);
    }

    @PutMapping("/password")
    public ApiResponse<Void> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        User user = getCurrentUser();
        userService.updatePassword(user.getId(), request.getOldPassword(), request.getNewPassword());
        return ApiResponse.success();
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserVO> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User user = getCurrentUser();
        UserVO updated = userService.uploadAvatar(user.getId(), file);
        return ApiResponse.success(updated);
    }

    @PostMapping("/email/send-code")
    @RateLimit(value = 5.0, key = "send_bind_email_code")
    public ApiResponse<Void> sendBindEmailCode(@Valid @RequestBody SendEmailCodeRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getEmail() != null && request.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new IllegalArgumentException("该邮箱已与当前账户绑定");
        }
        String code = emailService.generateVerificationCode();
        verificationTokenService.saveCode(request.getEmail(), VerificationTokenService.TYPE_BIND_EMAIL, code);
        emailService.sendBindEmailCode(request.getEmail(), code);
        return ApiResponse.success();
    }

    @PostMapping("/email/bind")
    public ApiResponse<UserVO> bindEmail(@Valid @RequestBody BindEmailRequest request) {
        User user = getCurrentUser();
        UserVO updated = userService.bindEmail(user.getId(), request.getEmail(), request.getCode());
        return ApiResponse.success(updated);
    }
}
