package com.sarthak.archflow_ai.service.impl;

import com.sarthak.archflow_ai.dto.DiagramDto;
import com.sarthak.archflow_ai.entity.Diagram;
import com.sarthak.archflow_ai.entity.User;
import com.sarthak.archflow_ai.entity.VersionHistory;
import com.sarthak.archflow_ai.repository.DiagramRepository;
import com.sarthak.archflow_ai.repository.VersionHistoryRepository;
import com.sarthak.archflow_ai.repository.PromptHistoryRepository;
import com.sarthak.archflow_ai.service.DiagramService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagramServiceImpl implements DiagramService {

    private final DiagramRepository diagramRepository;
    private final VersionHistoryRepository versionHistoryRepository;
    private final PromptHistoryRepository promptHistoryRepository;

    @Override
    @Transactional
    public DiagramDto createDiagram(DiagramDto dto, User user) {
        Diagram diagram = Diagram.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .graphJson(dto.getGraphJson() != null ? dto.getGraphJson() : "{\"nodes\": [], \"edges\": []}")
                .isPublic(dto.isPublic())
                .user(user)
                .build();

        Diagram savedDiagram = diagramRepository.save(diagram);
        
        // Save initial version 1 snapshot
        createVersionSnapshotInternal(savedDiagram, user, 1);
        
        return mapToDto(savedDiagram);
    }

    @Override
    @Transactional
    public DiagramDto updateDiagram(UUID id, DiagramDto dto, User user) {
        Diagram diagram = getDiagramEntity(id, user);

        diagram.setName(dto.getName());
        diagram.setDescription(dto.getDescription());
        diagram.setGraphJson(dto.getGraphJson());
        diagram.setPublic(dto.isPublic());

        Diagram updated = diagramRepository.save(diagram);
        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DiagramDto getDiagramById(UUID id, User user) {
        Diagram diagram = diagramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Diagram not found"));
        
        // Access controls
        if (!diagram.isPublic() && !diagram.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to view this diagram");
        }

        return mapToDto(diagram);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiagramDto> getMyDiagrams(User user) {
        return diagramRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDiagram(UUID id, User user) {
        Diagram diagram = getDiagramEntity(id, user);
        versionHistoryRepository.deleteByDiagram_Id(diagram.getId());
        promptHistoryRepository.deleteByDiagramId(diagram.getId());
        diagramRepository.delete(diagram);
    }

    @Override
    @Transactional
    public DiagramDto createVersionSnapshot(UUID id, User user) {
        Diagram diagram = getDiagramEntity(id, user);
        
        // Find maximum version number currently
        List<VersionHistory> versions = versionHistoryRepository.findByDiagramIdOrderByVersionNumberDesc(diagram.getId());
        int nextVersion = versions.isEmpty() ? 1 : versions.get(0).getVersionNumber() + 1;
        
        VersionHistory version = createVersionSnapshotInternal(diagram, user, nextVersion);
        
        // Return dummy diagram DTO representation of the version history snapshot
        return DiagramDto.builder()
                .id(version.getId())
                .name(diagram.getName() + " - v" + version.getVersionNumber())
                .graphJson(version.getGraphJson())
                .createdAt(version.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiagramDto> getVersionHistory(UUID id, User user) {
        Diagram diagram = getDiagramEntity(id, user);
        return versionHistoryRepository.findByDiagramIdOrderByVersionNumberDesc(diagram.getId())
                .stream()
                .map(v -> DiagramDto.builder()
                        .id(v.getId()) // version snapshot ID
                        .name("Version " + v.getVersionNumber())
                        .graphJson(v.getGraphJson())
                        .createdAt(v.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DiagramDto rollbackToVersion(UUID diagramId, UUID versionSnapshotId, User user) {
        Diagram diagram = getDiagramEntity(diagramId, user);
        
        VersionHistory snapshot = versionHistoryRepository.findById(versionSnapshotId)
                .orElseThrow(() -> new RuntimeException("Version snapshot not found"));
        
        if (!snapshot.getDiagram().getId().equals(diagram.getId())) {
            throw new RuntimeException("Version mismatch error");
        }

        // Overwrite active layout with snapshot JSON
        diagram.setGraphJson(snapshot.getGraphJson());
        Diagram restored = diagramRepository.save(diagram);
        
        return mapToDto(restored);
    }

    private VersionHistory createVersionSnapshotInternal(Diagram diagram, User user, int versionNumber) {
        VersionHistory version = VersionHistory.builder()
                .diagram(diagram)
                .graphJson(diagram.getGraphJson())
                .user(user)
                .versionNumber(versionNumber)
                .build();
        return versionHistoryRepository.save(version);
    }

    private Diagram getDiagramEntity(UUID id, User user) {
        Diagram diagram = diagramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Diagram not found"));
        
        if (!diagram.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Access denied for this diagram");
        }
        return diagram;
    }

    private DiagramDto mapToDto(Diagram entity) {
        return DiagramDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .graphJson(entity.getGraphJson())
                .userId(entity.getUser().getId())
                .isPublic(entity.isPublic())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
