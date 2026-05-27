package com.sarthak.archflow_ai.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class GenerateDiagramRequest {

    @NotBlank(message = "Prompt cannot be blank")
    private String prompt;

    private String provider;

    private UUID diagramId;

    // Constructors
    public GenerateDiagramRequest() {}

    public GenerateDiagramRequest(String prompt, String provider, UUID diagramId) {
        this.prompt = prompt;
        this.provider = provider;
        this.diagramId = diagramId;
    }

    // Getters and Setters
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public UUID getDiagramId() { return diagramId; }
    public void setDiagramId(UUID diagramId) { this.diagramId = diagramId; }
}
