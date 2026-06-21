package com.blog.service;

import com.blog.dto.CategoryVO;
import com.blog.entity.Category;
import com.blog.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    public List<CategoryVO> getAllCategories() {
        List<Category> categories = categoryMapper.findAll();
        return categories.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Transactional
    public CategoryVO createCategory(CategoryVO vo) {
        Category existing = categoryMapper.findByName(vo.getName());
        if (existing != null) {
            throw new IllegalArgumentException("分类名称已存在");
        }

        Category category = new Category();
        category.setName(vo.getName());
        category.setColor(vo.getColor() != null ? vo.getColor() : "#ff6b35");
        category.setCreatedAt(LocalDateTime.now());

        categoryMapper.insert(category);

        return convertToVO(category);
    }

    @Transactional
    public CategoryVO updateCategory(Long id, CategoryVO vo) {
        Category category = categoryMapper.findById(id);
        if (category == null) {
            throw new IllegalArgumentException("分类不存在");
        }

        if (vo.getName() != null && !vo.getName().equals(category.getName())) {
            Category existing = categoryMapper.findByName(vo.getName());
            if (existing != null && !existing.getId().equals(id)) {
                throw new IllegalArgumentException("分类名称已存在");
            }
            category.setName(vo.getName());
        }

        if (vo.getColor() != null) {
            category.setColor(vo.getColor());
        }

        categoryMapper.update(category);

        return convertToVO(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryMapper.findById(id);
        if (category == null) {
            throw new IllegalArgumentException("分类不存在");
        }
        categoryMapper.deleteById(id);
    }

    private CategoryVO convertToVO(Category category) {
        CategoryVO vo = new CategoryVO();
        vo.setId(category.getId());
        vo.setName(category.getName());
        vo.setColor(category.getColor());
        vo.setArticleCount(0);
        return vo;
    }
}
