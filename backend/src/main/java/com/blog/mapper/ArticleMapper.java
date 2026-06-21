package com.blog.mapper;

import com.blog.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArticleMapper {
    void insert(Article article);
    void update(Article article);
    void deleteById(@Param("id") Long id);
    Article findById(@Param("id") Long id);
    List<Article> findPublishedList(@Param("offset") int offset, @Param("size") int size);
    long countPublished();
    List<Article> findAllList(@Param("offset") int offset, @Param("size") int size, @Param("status") String status);
    long countAll(@Param("status") String status);
    List<Article> findDrafts(@Param("offset") int offset, @Param("size") int size);
    long countDrafts();
    void batchPublish(@Param("ids") List<Long> ids);
    void batchDelete(@Param("ids") List<Long> ids);
    void incrementLikeCount(@Param("id") Long id);
}
