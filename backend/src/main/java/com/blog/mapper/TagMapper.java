package com.blog.mapper;

import com.blog.entity.Tag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TagMapper {
    void insert(Tag tag);
    void update(Tag tag);
    void deleteById(@Param("id") Long id);
    Tag findById(@Param("id") Long id);
    Tag findByName(@Param("name") String name);
    List<Tag> findAll();
    List<Tag> findByArticleId(@Param("articleId") Long articleId);
}
