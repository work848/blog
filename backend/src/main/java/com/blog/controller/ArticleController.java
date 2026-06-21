package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.ApiResponse;
import com.blog.dto.ArticleVO;
import com.blog.dto.LikeResponse;
import com.blog.dto.PageResult;
import com.blog.service.ArticleService;
import com.blog.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private LikeService likeService;

    @GetMapping
    @RateLimit(value = 100.0, key = "get_articles")
    public ApiResponse<PageResult<ArticleVO>> getPublishedArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<ArticleVO> result = articleService.getPublishedArticles(page, size);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    @RateLimit(value = 100.0, key = "get_article")
    public ApiResponse<ArticleVO> getArticleById(@PathVariable Long id) {
        ArticleVO article = articleService.getArticleById(id);
        return ApiResponse.success(article);
    }

    @PostMapping("/{id}/like")
    @RateLimit(value = 60.0, key = "like_article")
    public ApiResponse<LikeResponse> likeArticle(@PathVariable Long id) {
        LikeResponse response = likeService.likeArticle(id);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}/like/status")
    @RateLimit(value = 100.0, key = "get_like_status")
    public ApiResponse<LikeResponse> getLikeStatus(@PathVariable Long id) {
        LikeResponse response = likeService.getLikeStatus(id);
        return ApiResponse.success(response);
    }
}
