package com.blog.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Slf4j
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@blog.com}")
    private String fromEmail;

    private final SecureRandom random = new SecureRandom();

    public String generateVerificationCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    public void sendBindEmailCode(String toEmail, String code) {
        String subject = "邮箱绑定验证码 - 博客系统";
        String content = buildEmailContent("邮箱绑定", code, "绑定您的账户邮箱");
        sendEmail(toEmail, subject, content);
    }

    public void sendForgotPasswordCode(String toEmail, String code) {
        String subject = "重置密码验证码 - 博客系统";
        String content = buildEmailContent("密码重置", code, "重置您的账户密码");
        sendEmail(toEmail, subject, content);
    }

    private String buildEmailContent(String operation, String code, String purpose) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #f5f7fa; }
                    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                    .header { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; }
                    .content { color: #555; line-height: 1.6; margin-bottom: 24px; }
                    .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; margin-bottom: 24px; }
                    .tip { color: #888; font-size: 13px; }
                    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #aaa; font-size: 12px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">%s - 博客系统</div>
                    <div class="content">
                        <p>您好！</p>
                        <p>您正在使用此邮箱%s。您的验证码如下：</p>
                    </div>
                    <div class="code-box">%s</div>
                    <div class="tip">
                        <p>⚠️ 验证码 %d 分钟内有效，请勿泄露给他人。</p>
                        <p>如果您未进行此操作，请忽略此邮件。</p>
                    </div>
                    <div class="footer">
                        <p>此邮件由博客系统自动发送，请勿直接回复。</p>
                    </div>
                </div>
            </body>
            </html>
            """, operation, purpose, code, VerificationTokenService.CODE_EXPIRE_MINUTES);
    }

    private void sendEmail(String toEmail, String subject, String content) {
        if (mailSender == null) {
            log.warn("========================================");
            log.warn("JavaMailSender 未配置！邮件发送功能已禁用。");
            log.warn("请在 application.yml 中配置 spring.mail 相关参数");
            log.warn("模拟发送邮件 -> 收件人: {}, 主题: {}", toEmail, subject);
            log.warn("========================================");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("邮件发送失败: " + e.getMessage());
        }
    }
}
