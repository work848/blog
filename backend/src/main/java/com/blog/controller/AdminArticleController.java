package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.*;
import com.blog.service.ArticleService;
import com.blog.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/articles")
public class AdminArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private FileUploadService fileUploadService;

    @GetMapping
    @RateLimit(value = 60.0, key = "admin_get_articles")
    public ApiResponse<PageResult<ArticleVO>> getAllArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        PageResult<ArticleVO> result = articleService.getAllArticles(page, size, status);
        return ApiResponse.success(result);
    }

    @GetMapping("/drafts")
    @RateLimit(value = 60.0, key = "admin_get_drafts")
    public ApiResponse<PageResult<ArticleVO>> getDrafts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<ArticleVO> result = articleService.getDrafts(page, size);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    @RateLimit(value = 60.0, key = "admin_get_article")
    public ApiResponse<ArticleVO> getArticleById(@PathVariable Long id) {
        ArticleVO article = articleService.getArticleByIdForAdmin(id);
        return ApiResponse.success(article);
    }

    @PostMapping("/upload")
    @RateLimit(value = 30.0, key = "admin_upload_file")
    public ApiResponse<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileUploadService.parseTxtFile(file);
        return ApiResponse.success(response);
    }

    @PostMapping("/upload-image")
    @RateLimit(value = 30.0, key = "admin_upload_image")
    public ApiResponse<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        ImageUploadResponse response = fileUploadService.uploadImage(file);
        return ApiResponse.success(response);
    }

    @PostMapping
    @RateLimit(value = 30.0, key = "admin_create_article")
    public ApiResponse<ArticleVO> createArticle(@RequestBody ArticleCreateRequest request) {
        ArticleVO article = articleService.createArticle(request);
        return ApiResponse.success(article);
    }

    @PutMapping("/{id}")
    @RateLimit(value = 30.0, key = "admin_update_article")
    public ApiResponse<ArticleVO> updateArticle(
            @PathVariable Long id,
            @RequestBody ArticleUpdateRequest request) {
        ArticleVO article = articleService.updateArticle(id, request);
        return ApiResponse.success(article);
    }

    @DeleteMapping("/{id}")
    @RateLimit(value = 30.0, key = "admin_delete_article")
    public ApiResponse<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ApiResponse.success();
    }

    @PostMapping("/publish/batch")
    @RateLimit(value = 20.0, key = "admin_batch_publish")
    public ApiResponse<Void> batchPublish(@RequestBody BatchPublishRequest request) {
        articleService.batchPublish(request.getArticleIds());
        return ApiResponse.success();
    }

    @PostMapping("/{id}/withdraw")
    @RateLimit(value = 30.0, key = "admin_withdraw_article")
    public ApiResponse<Void> withdrawArticle(@PathVariable Long id) {
        articleService.withdrawArticle(id);
        return ApiResponse.success();
    }

    @PostMapping("/withdraw/batch")
    @RateLimit(value = 20.0, key = "admin_batch_withdraw")
    public ApiResponse<Void> batchWithdraw(@RequestBody BatchPublishRequest request) {
        articleService.batchWithdraw(request.getArticleIds());
        return ApiResponse.success();
    }

    @DeleteMapping("/batch")
    @RateLimit(value = 20.0, key = "admin_batch_delete")
    public ApiResponse<Void> batchDelete(@RequestBody BatchDeleteRequest request) {
        articleService.batchDelete(request.getArticleIds());
        return ApiResponse.success();
    }
}
