package com.sarthak.archflow_ai.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "diagrams")
public class Diagram {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "graph_json", columnDefinition = "TEXT")
    private String graphJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "diagram", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VersionHistory> versionHistories = new ArrayList<>();

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Diagram() {}

    public Diagram(UUID id, String name, String description, String graphJson, User user, List<VersionHistory> versionHistories, boolean isPublic, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.graphJson = graphJson;
        this.user = user;
        this.versionHistories = versionHistories != null ? versionHistories : new ArrayList<>();
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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<VersionHistory> getVersionHistories() { return versionHistories; }
    public void setVersionHistories(List<VersionHistory> versionHistories) { this.versionHistories = versionHistories; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static DiagramBuilder builder() {
        return new DiagramBuilder();
    }

    public static class DiagramBuilder {
        private UUID id;
        private String name;
        private String description;
        private String graphJson;
        private User user;
        private List<VersionHistory> versionHistories = new ArrayList<>();
        private boolean isPublic;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public DiagramBuilder id(UUID id) { this.id = id; return this; }
        public DiagramBuilder name(String name) { this.name = name; return this; }
        public DiagramBuilder description(String description) { this.description = description; return this; }
        public DiagramBuilder graphJson(String graphJson) { this.graphJson = graphJson; return this; }
        public DiagramBuilder user(User user) { this.user = user; return this; }
        public DiagramBuilder versionHistories(List<VersionHistory> versionHistories) { this.versionHistories = versionHistories; return this; }
        public DiagramBuilder isPublic(boolean isPublic) { this.isPublic = isPublic; return this; }
        public DiagramBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public DiagramBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Diagram build() {
            return new Diagram(id, name, description, graphJson, user, versionHistories, isPublic, createdAt, updatedAt);
        }
    }
}
