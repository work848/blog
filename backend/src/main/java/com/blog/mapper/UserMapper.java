package com.blog.mapper;

import com.blog.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findByUsername(@Param("username") String username);
    User findById(@Param("id") Long id);
    User findByEmail(@Param("email") String email);
    int updateUsername(@Param("id") Long id, @Param("username") String username);
    int updatePassword(@Param("id") Long id, @Param("passwordHash") String passwordHash);
    int updateEmail(@Param("id") Long id, @Param("email") String email);
    int updateAvatar(@Param("id") Long id, @Param("avatar") String avatar);
    int updatePasswordByEmail(@Param("email") String email, @Param("passwordHash") String passwordHash);
}
