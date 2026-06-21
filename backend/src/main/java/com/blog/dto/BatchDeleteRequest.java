package com.blog.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchDeleteRequest {
    private List<Long> articleIds;
}
