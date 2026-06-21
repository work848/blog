package com.blog.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchPublishRequest {
    private List<Long> articleIds;
}
