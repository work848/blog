package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.ApiResponse;
import com.blog.dto.TagVO;
import com.blog.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tags")
public class AdminTagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    @RateLimit(value = 60.0, key = "admin_get_tags")
    public ApiResponse<List<TagVO>> getAllTags() {
        List<TagVO> tags = tagService.getAllTags();
        return ApiResponse.success(tags);
    }

    @PostMapping
    @RateLimit(value = 30.0, key = "admin_create_tag")
    public ApiResponse<TagVO> createTag(@RequestBody TagVO vo) {
        TagVO tag = tagService.createTag(vo);
        return ApiResponse.success(tag);
    }

    @PutMapping("/{id}")
    @RateLimit(value = 30.0, key = "admin_update_tag")
    public ApiResponse<TagVO> updateTag(
            @PathVariable Long id,
            @RequestBody TagVO vo) {
        TagVO tag = tagService.updateTag(id, vo);
        return ApiResponse.success(tag);
    }

    @DeleteMapping("/{id}")
    @RateLimit(value = 30.0, key = "admin_delete_tag")
    public ApiResponse<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ApiResponse.success();
    }
}
