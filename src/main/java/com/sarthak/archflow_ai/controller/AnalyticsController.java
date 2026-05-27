package com.sarthak.archflow_ai.controller;

import com.sarthak.archflow_ai.repository.PromptHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final PromptHistoryRepository promptHistoryRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            Long totalTokens = promptHistoryRepository.getTotalTokensUsed();
            summary.put("totalTokensUsed", totalTokens != null ? totalTokens : 0L);
            summary.put("providerCounts", promptHistoryRepository.getPromptCountByProvider());
            summary.put("providerLatencies", promptHistoryRepository.getAvgLatencyByProvider());
            summary.put("providerTokens", promptHistoryRepository.getTokenUsageByProvider());
            summary.put("success", true);
        } catch (Exception e) {
            summary.put("success", false);
            summary.put("error", e.getMessage());
        }

        return ResponseEntity.ok(summary);
    }
}
