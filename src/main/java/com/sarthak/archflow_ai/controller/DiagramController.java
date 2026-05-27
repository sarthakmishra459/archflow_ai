package com.sarthak.archflow_ai.controller;

import com.sarthak.archflow_ai.dto.DiagramDto;
import com.sarthak.archflow_ai.entity.User;
import com.sarthak.archflow_ai.service.DiagramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagrams")
@RequiredArgsConstructor
public class DiagramController {

    private final DiagramService diagramService;

    @PostMapping
    public ResponseEntity<DiagramDto> createDiagram(@RequestBody DiagramDto dto, @AuthenticationPrincipal User user) {
        DiagramDto created = diagramService.createDiagram(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiagramDto> updateDiagram(
            @PathVariable UUID id, 
            @RequestBody DiagramDto dto, 
            @AuthenticationPrincipal User user) {
        DiagramDto updated = diagramService.updateDiagram(id, dto, user);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagramDto> getDiagram(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        DiagramDto diagram = diagramService.getDiagramById(id, user);
        return ResponseEntity.ok(diagram);
    }

    @GetMapping
    public ResponseEntity<List<DiagramDto>> getMyDiagrams(@AuthenticationPrincipal User user) {
        List<DiagramDto> diagrams = diagramService.getMyDiagrams(user);
        return ResponseEntity.ok(diagrams);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiagram(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        diagramService.deleteDiagram(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/version")
    public ResponseEntity<DiagramDto> createVersionSnapshot(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        DiagramDto version = diagramService.createVersionSnapshot(id, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(version);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<DiagramDto>> getVersionHistory(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        List<DiagramDto> versions = diagramService.getVersionHistory(id, user);
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{id}/rollback/{versionId}")
    public ResponseEntity<DiagramDto> rollbackToVersion(
            @PathVariable UUID id, 
            @PathVariable UUID versionId, 
            @AuthenticationPrincipal User user) {
        DiagramDto restored = diagramService.rollbackToVersion(id, versionId, user);
        return ResponseEntity.ok(restored);
    }
}
