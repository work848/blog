package com.blog.service;

import com.blog.dto.ImageUploadResponse;
import com.blog.dto.UserVO;
import com.blog.entity.User;
import com.blog.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private VerificationTokenService verificationTokenService;

    public UserVO getUserVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setEmail(user.getEmail());
        vo.setAvatar(user.getAvatar());
        vo.setRole(user.getRole());
        return vo;
    }

    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Transactional
    public UserVO updateUsername(Long userId, String newUsername) {
        User existingUser = userMapper.findByUsername(newUsername);
        if (existingUser != null) {
            throw new IllegalArgumentException("用户名已被使用");
        }
        int rows = userMapper.updateUsername(userId, newUsername);
        if (rows <= 0) {
            throw new RuntimeException("用户名更新失败");
        }
        User updated = userMapper.findById(userId);
        return getUserVO(updated);
    }

    @Transactional
    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("旧密码不正确");
        }
        if (oldPassword.equals(newPassword)) {
            throw new IllegalArgumentException("新密码不能与旧密码相同");
        }
        String encodedPassword = passwordEncoder.encode(newPassword);
        int rows = userMapper.updatePassword(userId, encodedPassword);
        if (rows <= 0) {
            throw new RuntimeException("密码更新失败");
        }
    }

    @Transactional
    public UserVO uploadAvatar(Long userId, MultipartFile file) {
        ImageUploadResponse uploadResponse = fileUploadService.uploadImage(file);
        int rows = userMapper.updateAvatar(userId, uploadResponse.getUrl());
        if (rows <= 0) {
            throw new RuntimeException("头像上传失败");
        }
        User updated = userMapper.findById(userId);
        return getUserVO(updated);
    }

    @Transactional
    public UserVO bindEmail(Long userId, String email, String code) {
        boolean valid = verificationTokenService.validateCode(email, VerificationTokenService.TYPE_BIND_EMAIL, code);
        if (!valid) {
            throw new IllegalArgumentException("验证码错误或已过期");
        }
        User existingUser = userMapper.findByEmail(email);
        if (existingUser != null && !existingUser.getId().equals(userId)) {
            throw new IllegalArgumentException("该邮箱已被其他用户绑定");
        }
        int rows = userMapper.updateEmail(userId, email);
        if (rows <= 0) {
            throw new RuntimeException("邮箱绑定失败");
        }
        verificationTokenService.removeCode(email, VerificationTokenService.TYPE_BIND_EMAIL);
        User updated = userMapper.findById(userId);
        return getUserVO(updated);
    }

    @Transactional
    public void resetPasswordByEmail(String email, String code, String newPassword) {
        boolean valid = verificationTokenService.validateCode(email, VerificationTokenService.TYPE_FORGOT_PASSWORD, code);
        if (!valid) {
            throw new IllegalArgumentException("验证码错误或已过期");
        }
        User user = userMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("该邮箱未绑定任何账户");
        }
        String encodedPassword = passwordEncoder.encode(newPassword);
        int rows = userMapper.updatePasswordByEmail(email, encodedPassword);
        if (rows <= 0) {
            throw new RuntimeException("密码重置失败");
        }
        verificationTokenService.removeCode(email, VerificationTokenService.TYPE_FORGOT_PASSWORD);
    }

    public void checkEmailExists(String email) {
        User user = userMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("该邮箱未绑定任何账户");
        }
    }
}
