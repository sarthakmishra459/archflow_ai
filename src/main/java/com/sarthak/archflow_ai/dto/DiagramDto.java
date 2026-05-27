package com.sarthak.archflow_ai.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DiagramDto {
    private UUID id;
    private String name;
    private String description;
    private String graphJson;
    private UUID userId;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public DiagramDto() {}

    public DiagramDto(UUID id, String name, String description, String graphJson, UUID userId, boolean isPublic, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.graphJson = graphJson;
        this.userId = userId;
        this.isPublic = isPublic;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGraphJson() { return graphJson; }
    public void setGraphJson(String graphJson) { this.graphJson = graphJson; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static DiagramDtoBuilder builder() {
        return new DiagramDtoBuilder();
    }

    public static class DiagramDtoBuilder {
        private UUID id;
        private String name;
        private String description;
        private String graphJson;
        private UUID userId;
        private boolean isPublic;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public DiagramDtoBuilder id(UUID id) { this.id = id; return this; }
        public DiagramDtoBuilder name(String name) { this.name = name; return this; }
        public DiagramDtoBuilder description(String description) { this.description = description; return this; }
        public DiagramDtoBuilder graphJson(String graphJson) { this.graphJson = graphJson; return this; }
        public DiagramDtoBuilder userId(UUID userId) { this.userId = userId; return this; }
        public DiagramDtoBuilder isPublic(boolean isPublic) { this.isPublic = isPublic; return this; }
        public DiagramDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public DiagramDtoBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public DiagramDto build() {
            return new DiagramDto(id, name, description, graphJson, userId, isPublic, createdAt, updatedAt);
        }
    }
}
