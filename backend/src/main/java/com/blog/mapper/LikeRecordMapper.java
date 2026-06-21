package com.blog.mapper;

import com.blog.entity.LikeRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LikeRecordMapper {
    void insert(LikeRecord record);
    LikeRecord findByArticleIdAndIp(@Param("articleId") Long articleId, @Param("ipAddress") String ipAddress);
    void deleteByArticleId(@Param("articleId") Long articleId);
}
