package com.blog.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArticleTagMapper {
    void insert(@Param("articleId") Long articleId, @Param("tagId") Long tagId);
    void deleteByArticleId(@Param("articleId") Long articleId);
    void deleteByTagId(@Param("tagId") Long tagId);
    List<Long> findTagIdsByArticleId(@Param("articleId") Long articleId);
}
