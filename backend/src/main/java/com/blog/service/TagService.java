package com.blog.service;

import com.blog.dto.TagVO;
import com.blog.entity.Tag;
import com.blog.mapper.ArticleTagMapper;
import com.blog.mapper.TagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService {

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    public List<TagVO> getAllTags() {
        List<Tag> tags = tagMapper.findAll();
        return tags.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Transactional
    public TagVO createTag(TagVO vo) {
        Tag existing = tagMapper.findByName(vo.getName());
        if (existing != null) {
            throw new IllegalArgumentException("标签名称已存在");
        }

        Tag tag = new Tag();
        tag.setName(vo.getName());
        tag.setCreatedAt(LocalDateTime.now());

        tagMapper.insert(tag);

        return convertToVO(tag);
    }

    @Transactional
    public TagVO updateTag(Long id, TagVO vo) {
        Tag tag = tagMapper.findById(id);
        if (tag == null) {
            throw new IllegalArgumentException("标签不存在");
        }

        if (vo.getName() != null && !vo.getName().equals(tag.getName())) {
            Tag existing = tagMapper.findByName(vo.getName());
            if (existing != null && !existing.getId().equals(id)) {
                throw new IllegalArgumentException("标签名称已存在");
            }
            tag.setName(vo.getName());
        }

        tagMapper.update(tag);

        return convertToVO(tag);
    }

    @Transactional
    public void deleteTag(Long id) {
        Tag tag = tagMapper.findById(id);
        if (tag == null) {
            throw new IllegalArgumentException("标签不存在");
        }
        articleTagMapper.deleteByTagId(id);
        tagMapper.deleteById(id);
    }

    private TagVO convertToVO(Tag tag) {
        TagVO vo = new TagVO();
        vo.setId(tag.getId());
        vo.setName(tag.getName());
        vo.setArticleCount(0);
        return vo;
    }
}
