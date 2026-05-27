package com.sarthak.archflow_ai.repository;

import com.sarthak.archflow_ai.entity.VersionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VersionHistoryRepository extends JpaRepository<VersionHistory, UUID> {
    List<VersionHistory> findByDiagramIdOrderByVersionNumberDesc(UUID diagramId);
    Optional<VersionHistory> findFirstByDiagramIdOrderByVersionNumberDesc(UUID diagramId);
    void deleteByDiagram_Id(UUID diagramId);
}
