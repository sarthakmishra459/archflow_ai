package com.sarthak.archflow_ai.service;

import com.sarthak.archflow_ai.dto.DiagramDto;
import com.sarthak.archflow_ai.entity.User;

import java.util.List;
import java.util.UUID;

public interface DiagramService {
    DiagramDto createDiagram(DiagramDto dto, User user);
    DiagramDto updateDiagram(UUID id, DiagramDto dto, User user);
    DiagramDto getDiagramById(UUID id, User user);
    List<DiagramDto> getMyDiagrams(User user);
    void deleteDiagram(UUID id, User user);
    
    DiagramDto createVersionSnapshot(UUID id, User user);
    List<DiagramDto> getVersionHistory(UUID id, User user);
    DiagramDto rollbackToVersion(UUID diagramId, UUID versionId, User user);
}
