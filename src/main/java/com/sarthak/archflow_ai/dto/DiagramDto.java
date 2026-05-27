package com.sarthak.archflow_ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagramDto {
    private UUID id;
    private String name;
    private String description;
    private String graphJson;
    private UUID userId;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
