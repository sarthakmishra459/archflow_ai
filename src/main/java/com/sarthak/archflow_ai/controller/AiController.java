package com.sarthak.archflow_ai.controller;

import com.sarthak.archflow_ai.ai.AIService;
import com.sarthak.archflow_ai.dto.EditDiagramRequest;
import com.sarthak.archflow_ai.dto.GenerateDiagramRequest;
import com.sarthak.archflow_ai.entity.Diagram;
import com.sarthak.archflow_ai.repository.DiagramRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AIService aiService;
    private final DiagramRepository diagramRepository;

    @PostMapping("/generate")
    public ResponseEntity<String> generateDiagram(@Valid @RequestBody GenerateDiagramRequest request) {
        Diagram diagram = null;
        if (request.getDiagramId() != null) {
            Optional<Diagram> opt = diagramRepository.findById(request.getDiagramId());
            if (opt.isPresent()) {
                diagram = opt.get();
            }
        }

        String graphJson = aiService.generateDiagram(request.getPrompt(), request.getProvider(), diagram);
        return ResponseEntity.ok(graphJson);
    }

    @PostMapping("/edit")
    public ResponseEntity<String> editDiagram(@Valid @RequestBody EditDiagramRequest request) {
        Diagram diagram = null;
        if (request.getDiagramId() != null) {
            Optional<Diagram> opt = diagramRepository.findById(request.getDiagramId());
            if (opt.isPresent()) {
                diagram = opt.get();
            }
        }

        String updatedGraphJson = aiService.editDiagram(
                request.getEditInstruction(), 
                request.getCurrentGraphJson(), 
                request.getProvider(), 
                diagram
        );
        return ResponseEntity.ok(updatedGraphJson);
    }
}
