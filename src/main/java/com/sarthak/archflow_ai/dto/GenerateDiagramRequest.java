package com.sarthak.archflow_ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateDiagramRequest {

    @NotBlank(message = "Prompt cannot be blank")
    private String prompt;

    private String provider;

    private UUID diagramId;
}
