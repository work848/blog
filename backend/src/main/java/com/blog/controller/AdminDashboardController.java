package com.blog.controller;

import com.blog.aspect.RateLimit;
import com.blog.dto.ApiResponse;
import com.blog.dto.DashboardStatsVO;
import com.blog.dto.StatsTrendVO;
import com.blog.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private ArticleService articleService;

    @GetMapping("/stats")
    @RateLimit(value = 60.0, key = "admin_dashboard_stats")
    public ApiResponse<DashboardStatsVO> getStats() {
        DashboardStatsVO stats = articleService.getDashboardStats();
        return ApiResponse.success(stats);
    }

    @GetMapping("/trend")
    @RateLimit(value = 60.0, key = "admin_dashboard_trend")
    public ApiResponse<List<StatsTrendVO>> getTrend(
            @RequestParam(defaultValue = "30") int days) {
        int safeDays = Math.max(7, Math.min(30, days));
        List<StatsTrendVO> trend = articleService.getStatsTrend(safeDays);
        return ApiResponse.success(trend);
    }
}
