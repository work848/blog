package com.blog.service;

import com.blog.dto.LikeResponse;
import com.blog.entity.LikeRecord;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.LikeRecordMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LikeService {

    @Autowired
    private LikeRecordMapper likeRecordMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private HttpServletRequest request;

    @Transactional
    public LikeResponse likeArticle(Long articleId) {
        String ip = getClientIp();

        LikeRecord existing = likeRecordMapper.findByArticleIdAndIp(articleId, ip);
        if (existing != null) {
            return new LikeResponse(true, existing != null ? getLikeCount(articleId) : 0);
        }

        LikeRecord record = new LikeRecord();
        record.setArticleId(articleId);
        record.setIpAddress(ip);
        record.setCreatedAt(LocalDateTime.now());

        likeRecordMapper.insert(record);
        articleMapper.incrementLikeCount(articleId);

        int newCount = getLikeCount(articleId);
        return new LikeResponse(true, newCount);
    }

    public LikeResponse getLikeStatus(Long articleId) {
        String ip = getClientIp();
        LikeRecord existing = likeRecordMapper.findByArticleIdAndIp(articleId, ip);
        int count = getLikeCount(articleId);
        return new LikeResponse(existing != null, count);
    }

    private int getLikeCount(Long articleId) {
        var article = articleMapper.findById(articleId);
        return article != null ? article.getLikeCount() : 0;
    }

    private String getClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
