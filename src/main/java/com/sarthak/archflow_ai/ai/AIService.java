package com.sarthak.archflow_ai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sarthak.archflow_ai.entity.Diagram;
import com.sarthak.archflow_ai.entity.PromptHistory;
import com.sarthak.archflow_ai.repository.PromptHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final Map<String, AIProvider> providers;
    private final PromptHistoryRepository promptHistoryRepository;
    private final ObjectMapper objectMapper;

    @Value("${archflow.ai.default-provider:gemini}")
    private String defaultProviderName;

    public AIService(List<AIProvider> providerList, 
                      PromptHistoryRepository promptHistoryRepository,
                      ObjectMapper objectMapper) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(
                        p -> p.getName().toLowerCase(),
                        p -> p
                ));
        this.promptHistoryRepository = promptHistoryRepository;
        this.objectMapper = objectMapper;
    }

    public String generateDiagram(String userPrompt, String providerName, Diagram diagram) {
        if (shouldReturnEmptyGraph(userPrompt)) {
            String emptyGraph = emptyGraphJson();
            savePromptHistory(userPrompt, emptyGraph, getActiveProvider(providerName).toUpperCase(), 0, diagram);
            return emptyGraph;
        }

        String activeProvider = getActiveProvider(providerName);
        AIProvider provider = providers.get(activeProvider);

        String systemPrompt = """
                You are an expert enterprise system architect.
                Generate a system architecture diagram for the user's request.
                You must return a valid JSON object only. Do NOT wrap the JSON in markdown code blocks like ```json or any other text.
                
                The JSON MUST conform to this exact schema:
                {
                  "nodes": [
                    {
                      "id": "unique-node-id",
                      "type": "client" | "gateway" | "service" | "database" | "queue" | "cache",
                      "label": "Display Name"
                    }
                  ],
                  "edges": [
                    {
                      "id": "unique-edge-id",
                      "source": "source-node-id",
                      "target": "target-node-id",
                      "label": "Optional connector description"
                    }
                  ]
                }
                
                Guidelines:
                1. Include all necessary architectural layers (clients, gateways, services, databases, caching, message queues) depending on the requirement.
                2. Do not generate position coordinates. Node layout and hierarchy are handled automatically by the system.
                """;

        long startTime = System.currentTimeMillis();
        String resultJson = "";
        try {
            resultJson = provider.generateDiagram(userPrompt, systemPrompt);
            resultJson = sanitizeJson(resultJson);
            return resultJson;
        } finally {
            long latency = System.currentTimeMillis() - startTime;
            savePromptHistory(userPrompt, resultJson, activeProvider.toUpperCase(), latency, diagram);
        }
    }

    public String editDiagram(String editInstruction, String currentGraphJson, String providerName, Diagram diagram) {
        if (shouldReturnEmptyGraph(editInstruction)) {
            String emptyGraph = emptyGraphJson();
            savePromptHistory(editInstruction, emptyGraph, getActiveProvider(providerName).toUpperCase(), 0, diagram);
            return emptyGraph;
        }

        String activeProvider = getActiveProvider(providerName);
        AIProvider provider = providers.get(activeProvider);

        String systemPrompt = String.format("""
                You are an expert software architect.
                You are modifying an existing system architecture diagram based on the user's instructions.
                
                Current Diagram State JSON:
                %s
                
                You must return a valid JSON object containing the updated nodes and edges. Do NOT wrap the response in markdown blocks.
                
                Crucial Editing Constraints:
                1. Retain the IDs of unmodified nodes.
                2. Insert, update, or remove nodes/edges according to the user's instructions.
                3. Maintain standard node types: "client", "gateway", "service", "database", "queue", "cache".
                4. Do not generate or modify node coordinates or positions. Position layout is automatically computed.
                """, currentGraphJson);

        long startTime = System.currentTimeMillis();
        String resultJson = "";
        try {
            resultJson = provider.generateDiagram(editInstruction, systemPrompt);
            resultJson = sanitizeJson(resultJson);
            return resultJson;
        } finally {
            long latency = System.currentTimeMillis() - startTime;
            savePromptHistory(editInstruction, resultJson, activeProvider.toUpperCase(), latency, diagram);
        }
    }

    private boolean shouldReturnEmptyGraph(String prompt) {
        if (prompt == null) {
            return false;
        }
        String normalized = prompt.toLowerCase();
        return normalized.contains("remove existing nodes")
                || normalized.contains("remove nodes")
                || normalized.contains("empty nodes")
                || normalized.contains("clear nodes")
                || normalized.contains("give empty nodes")
                || normalized.contains("delete all nodes")
                || normalized.contains("clear the canvas")
                || normalized.contains("remove all nodes");
    }

    private String emptyGraphJson() {
        return "{\"nodes\": [], \"edges\": []}";
    }

    private String getActiveProvider(String requestedProvider) {
        if (requestedProvider != null && providers.containsKey(requestedProvider.toLowerCase())) {
            return requestedProvider.toLowerCase();
        }
        return defaultProviderName.toLowerCase();
    }

    private String sanitizeJson(String json) {
        if (json == null) return "{}";
        String cleaned = json.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private void savePromptHistory(String prompt, String response, String provider, long latencyMs, Diagram diagram) {
        try {
            // Rough estimation of token usage (4 characters ~ 1 token)
            int promptTokens = prompt.length() / 4;
            int responseTokens = response.length() / 4;
            int totalTokens = promptTokens + responseTokens;

            PromptHistory history = PromptHistory.builder()
                    .diagram(diagram)
                    .prompt(prompt)
                    .responseJson(response)
                    .provider(provider)
                    .latencyMs(latencyMs)
                    .tokenUsage(totalTokens)
                    .build();

            promptHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to persist prompt history log: ", e);
        }
    }
}
