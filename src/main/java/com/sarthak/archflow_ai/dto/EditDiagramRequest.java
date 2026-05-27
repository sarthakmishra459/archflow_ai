package com.sarthak.archflow_ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditDiagramRequest {

    @NotBlank(message = "Instruction cannot be blank")
    private String editInstruction;

    @NotBlank(message = "Current graph JSON cannot be blank")
    private String currentGraphJson;

    private String provider;

    private UUID diagramId;
}
