package com.sarthak.archflow_ai.repository;

import com.sarthak.archflow_ai.entity.PromptHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface PromptHistoryRepository extends JpaRepository<PromptHistory, UUID> {
    
    List<PromptHistory> findByDiagramIdOrderByCreatedAtDesc(UUID diagramId);

    void deleteByDiagramId(UUID diagramId);

    @Query("SELECT p.provider as provider, COUNT(p) as count FROM PromptHistory p GROUP BY p.provider")
    List<Map<String, Object>> getPromptCountByProvider();

    @Query("SELECT p.provider as provider, AVG(p.latencyMs) as avgLatency FROM PromptHistory p GROUP BY p.provider")
    List<Map<String, Object>> getAvgLatencyByProvider();

    @Query("SELECT SUM(p.tokenUsage) FROM PromptHistory p")
    Long getTotalTokensUsed();

    @Query("SELECT p.provider as provider, SUM(p.tokenUsage) as totalTokens FROM PromptHistory p GROUP BY p.provider")
    List<Map<String, Object>> getTokenUsageByProvider();
}
