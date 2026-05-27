package com.sarthak.archflow_ai.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prompt_history")
public class PromptHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagram_id")
    private Diagram diagram;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(name = "response_json", columnDefinition = "TEXT")
    private String responseJson;

    @Column(nullable = false)
    private String provider;

    @Column(name = "latency_ms")
    private long latencyMs;

    @Column(name = "token_usage")
    private int tokenUsage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public PromptHistory() {}

    public PromptHistory(UUID id, Diagram diagram, String prompt, String responseJson, String provider, long latencyMs, int tokenUsage, LocalDateTime createdAt) {
        this.id = id;
        this.diagram = diagram;
        this.prompt = prompt;
        this.responseJson = responseJson;
        this.provider = provider;
        this.latencyMs = latencyMs;
        this.tokenUsage = tokenUsage;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Diagram getDiagram() { return diagram; }
    public void setDiagram(Diagram diagram) { this.diagram = diagram; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getResponseJson() { return responseJson; }
    public void setResponseJson(String responseJson) { this.responseJson = responseJson; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }

    public int getTokenUsage() { return tokenUsage; }
    public void setTokenUsage(int tokenUsage) { this.tokenUsage = tokenUsage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static PromptHistoryBuilder builder() {
        return new PromptHistoryBuilder();
    }

    public static class PromptHistoryBuilder {
        private UUID id;
        private Diagram diagram;
        private String prompt;
        private String responseJson;
        private String provider;
        private long latencyMs;
        private int tokenUsage;
        private LocalDateTime createdAt;

        public PromptHistoryBuilder id(UUID id) { this.id = id; return this; }
        public PromptHistoryBuilder diagram(Diagram diagram) { this.diagram = diagram; return this; }
        public PromptHistoryBuilder prompt(String prompt) { this.prompt = prompt; return this; }
        public PromptHistoryBuilder responseJson(String responseJson) { this.responseJson = responseJson; return this; }
        public PromptHistoryBuilder provider(String provider) { this.provider = provider; return this; }
        public PromptHistoryBuilder latencyMs(long latencyMs) { this.latencyMs = latencyMs; return this; }
        public PromptHistoryBuilder tokenUsage(int tokenUsage) { this.tokenUsage = tokenUsage; return this; }
        public PromptHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PromptHistory build() {
            return new PromptHistory(id, diagram, prompt, responseJson, provider, latencyMs, tokenUsage, createdAt);
        }
    }
}
