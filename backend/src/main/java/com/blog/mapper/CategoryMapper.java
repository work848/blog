package com.blog.mapper;

import com.blog.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CategoryMapper {
    void insert(Category category);
    void update(Category category);
    void deleteById(@Param("id") Long id);
    Category findById(@Param("id") Long id);
    Category findByName(@Param("name") String name);
    List<Category> findAll();
}
