package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.ApiResponse;
import com.blog.dto.CategoryVO;
import com.blog.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    @RateLimit(value = 60.0, key = "admin_get_categories")
    public ApiResponse<List<CategoryVO>> getAllCategories() {
        List<CategoryVO> categories = categoryService.getAllCategories();
        return ApiResponse.success(categories);
    }

    @PostMapping
    @RateLimit(value = 30.0, key = "admin_create_category")
    public ApiResponse<CategoryVO> createCategory(@RequestBody CategoryVO vo) {
        CategoryVO category = categoryService.createCategory(vo);
        return ApiResponse.success(category);
    }

    @PutMapping("/{id}")
    @RateLimit(value = 30.0, key = "admin_update_category")
    public ApiResponse<CategoryVO> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryVO vo) {
        CategoryVO category = categoryService.updateCategory(id, vo);
        return ApiResponse.success(category);
    }

    @DeleteMapping("/{id}")
    @RateLimit(value = 30.0, key = "admin_delete_category")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success();
    }
}
