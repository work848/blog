package com.blog.mapper;

import com.blog.entity.Settings;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SettingsMapper {
    Settings findByKey(@Param("settingKey") String settingKey);
    List<Settings> findAll();
    int insertOrUpdate(@Param("settingKey") String settingKey, @Param("settingValue") String settingValue, @Param("description") String description);
}
