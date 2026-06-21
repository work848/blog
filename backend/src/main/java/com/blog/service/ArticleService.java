package com.blog.service;

import com.blog.dto.*;
import com.blog.entity.Article;
import com.blog.entity.Category;
import com.blog.entity.Tag;
import com.blog.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private LikeRecordMapper likeRecordMapper;

    public PageResult<ArticleVO> getPublishedArticles(int page, int size) {
        int offset = (page - 1) * size;
        List<Article> articles = articleMapper.findPublishedList(offset, size);
        long total = articleMapper.countPublished();

        List<ArticleVO> voList = articles.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, total, page, size);
    }

    public ArticleVO getArticleById(Long id) {
        Article article = articleMapper.findById(id);
        if (article == null) {
            throw new IllegalArgumentException("文章不存在");
        }
        if (!"PUBLISHED".equals(article.getStatus())) {
            throw new IllegalArgumentException("文章未发布");
        }
        return convertToVO(article);
    }

    public PageResult<ArticleVO> getAllArticles(int page, int size, String status) {
        int offset = (page - 1) * size;
        List<Article> articles = articleMapper.findAllList(offset, size, status);
        long total = articleMapper.countAll(status);

        List<ArticleVO> voList = articles.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, total, page, size);
    }

    public PageResult<ArticleVO> getDrafts(int page, int size) {
        int offset = (page - 1) * size;
        List<Article> articles = articleMapper.findDrafts(offset, size);
        long total = articleMapper.countDrafts();

        List<ArticleVO> voList = articles.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, total, page, size);
    }

    public ArticleVO getArticleByIdForAdmin(Long id) {
        Article article = articleMapper.findById(id);
        if (article == null) {
            throw new IllegalArgumentException("文章不存在");
        }
        return convertToVO(article);
    }

    @Transactional
    public ArticleVO createArticle(ArticleCreateRequest request) {
        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setSummary(request.getSummary() != null ? request.getSummary() : generateSummary(request.getContent()));
        article.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        article.setCategoryId(request.getCategoryId());
        article.setLikeCount(0);
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());

        if ("PUBLISHED".equals(article.getStatus())) {
            article.setPublishedAt(LocalDateTime.now());
        }

        articleMapper.insert(article);

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            for (Long tagId : request.getTagIds()) {
                articleTagMapper.insert(article.getId(), tagId);
            }
        }

        return convertToVO(article);
    }

    @Transactional
    public ArticleVO updateArticle(Long id, ArticleUpdateRequest request) {
        Article article = articleMapper.findById(id);
        if (article == null) {
            throw new IllegalArgumentException("文章不存在");
        }

        if (request.getTitle() != null) {
            article.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            article.setContent(request.getContent());
            article.setSummary(generateSummary(request.getContent()));
        }
        if (request.getSummary() != null) {
            article.setSummary(request.getSummary());
        }
        if (request.getCategoryId() != null) {
            article.setCategoryId(request.getCategoryId());
        }
        if (request.getStatus() != null) {
            article.setStatus(request.getStatus());
            if ("PUBLISHED".equals(request.getStatus()) && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }
        article.setUpdatedAt(LocalDateTime.now());

        articleMapper.update(article);

        if (request.getTagIds() != null) {
            articleTagMapper.deleteByArticleId(id);
            for (Long tagId : request.getTagIds()) {
                articleTagMapper.insert(id, tagId);
            }
        }

        return convertToVO(article);
    }

    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleMapper.findById(id);
        if (article == null) {
            throw new IllegalArgumentException("文章不存在");
        }
        articleTagMapper.deleteByArticleId(id);
        likeRecordMapper.deleteByArticleId(id);
        articleMapper.deleteById(id);
    }

    @Transactional
    public void batchPublish(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return;
        }
        articleMapper.batchPublish(articleIds);
    }

    @Transactional
    public void batchDelete(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return;
        }
        for (Long id : articleIds) {
            articleTagMapper.deleteByArticleId(id);
            likeRecordMapper.deleteByArticleId(id);
        }
        articleMapper.batchDelete(articleIds);
    }

    private String generateSummary(String content) {
        if (content == null) {
            return "";
        }
        String plainText = content.replaceAll("#+\\s*", "")
                .replaceAll("\\*\\*|__", "")
                .replaceAll("\\*|_", "")
                .replaceAll("`{1,3}", "")
                .replaceAll("\\[([^]]+)]\\([^)]+\\)", "$1")
                .replaceAll("\\n+", " ")
                .trim();
        return plainText.length() > 200 ? plainText.substring(0, 200) + "..." : plainText;
    }

    private ArticleVO convertToVO(Article article) {
        ArticleVO vo = new ArticleVO();
        vo.setId(article.getId());
        vo.setTitle(article.getTitle());
        vo.setContent(article.getContent());
        vo.setSummary(article.getSummary());
        vo.setStatus(article.getStatus());
        vo.setCategoryId(article.getCategoryId());
        vo.setLikeCount(article.getLikeCount());
        vo.setCreatedAt(article.getCreatedAt());
        vo.setUpdatedAt(article.getUpdatedAt());
        vo.setPublishedAt(article.getPublishedAt());

        if (article.getCategoryId() != null) {
            Category category = categoryMapper.findById(article.getCategoryId());
            if (category != null) {
                CategoryVO categoryVO = new CategoryVO();
                categoryVO.setId(category.getId());
                categoryVO.setName(category.getName());
                categoryVO.setColor(category.getColor());
                vo.setCategory(categoryVO);
            }
        }

        List<Tag> tags = tagMapper.findByArticleId(article.getId());
        List<TagVO> tagVOs = tags.stream().map(tag -> {
            TagVO tagVO = new TagVO();
            tagVO.setId(tag.getId());
            tagVO.setName(tag.getName());
            return tagVO;
        }).collect(Collectors.toList());
        vo.setTags(tagVOs);

        return vo;
    }
}
