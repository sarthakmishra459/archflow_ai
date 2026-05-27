package com.sarthak.archflow_ai.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class EditDiagramRequest {

    @NotBlank(message = "Instruction cannot be blank")
    private String editInstruction;

    @NotBlank(message = "Current graph JSON cannot be blank")
    private String currentGraphJson;

    private String provider;

    private UUID diagramId;

    // Constructors
    public EditDiagramRequest() {}

    public EditDiagramRequest(String editInstruction, String currentGraphJson, String provider, UUID diagramId) {
        this.editInstruction = editInstruction;
        this.currentGraphJson = currentGraphJson;
        this.provider = provider;
        this.diagramId = diagramId;
    }

    // Getters and Setters
    public String getEditInstruction() { return editInstruction; }
    public void setEditInstruction(String editInstruction) { this.editInstruction = editInstruction; }

    public String getCurrentGraphJson() { return currentGraphJson; }
    public void setCurrentGraphJson(String currentGraphJson) { this.currentGraphJson = currentGraphJson; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public UUID getDiagramId() { return diagramId; }
    public void setDiagramId(UUID diagramId) { this.diagramId = diagramId; }
}
