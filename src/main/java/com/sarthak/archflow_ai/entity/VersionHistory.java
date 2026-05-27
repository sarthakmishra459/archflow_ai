package com.sarthak.archflow_ai.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "version_history")
public class VersionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagram_id", nullable = false)
    private Diagram diagram;

    @Column(name = "graph_json", columnDefinition = "TEXT", nullable = false)
    private String graphJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public VersionHistory() {}

    public VersionHistory(UUID id, Diagram diagram, String graphJson, User user, int versionNumber, LocalDateTime createdAt) {
        this.id = id;
        this.diagram = diagram;
        this.graphJson = graphJson;
        this.user = user;
        this.versionNumber = versionNumber;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Diagram getDiagram() { return diagram; }
    public void setDiagram(Diagram diagram) { this.diagram = diagram; }

    public String getGraphJson() { return graphJson; }
    public void setGraphJson(String graphJson) { this.graphJson = graphJson; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static VersionHistoryBuilder builder() {
        return new VersionHistoryBuilder();
    }

    public static class VersionHistoryBuilder {
        private UUID id;
        private Diagram diagram;
        private String graphJson;
        private User user;
        private int versionNumber;
        private LocalDateTime createdAt;

        public VersionHistoryBuilder id(UUID id) { this.id = id; return this; }
        public VersionHistoryBuilder diagram(Diagram diagram) { this.diagram = diagram; return this; }
        public VersionHistoryBuilder graphJson(String graphJson) { this.graphJson = graphJson; return this; }
        public VersionHistoryBuilder user(User user) { this.user = user; return this; }
        public VersionHistoryBuilder versionNumber(int versionNumber) { this.versionNumber = versionNumber; return this; }
        public VersionHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public VersionHistory build() {
            return new VersionHistory(id, diagram, graphJson, user, versionNumber, createdAt);
        }
    }
}
