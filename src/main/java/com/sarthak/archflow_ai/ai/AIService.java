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
                      "type": "client" | "gateway" | "service" | "database" | "queue",
                      "label": "Display Name",
                      "position": {
                        "x": 100,
                        "y": 100
                      }
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
                
                Guidelines for positioning:
                1. Standard left-to-right flow is preferred. Start client at x=50, gateways at x=250, services at x=450, and databases/caches at x=650 or 750.
                2. Vertically separate concurrent services (e.g. Order Service at y=100, Payment Service at y=250).
                3. Ensure no node positions overlap. Spacing should be at least 150-200 pixels apart.
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
        String activeProvider = getActiveProvider(providerName);
        AIProvider provider = providers.get(activeProvider);

        String systemPrompt = String.format("""
                You are an expert software architect.
                You are modifying an existing system architecture diagram based on the user's instructions.
                
                Current Diagram State JSON:
                %s
                
                You must return a valid JSON object containing the updated nodes and edges. Do NOT wrap the response in markdown blocks.
                
                Crucial Editing Constraints:
                1. Retain the IDs and general position coordinates of unmodified nodes so that the layout does not shift disorientingly.
                2. Insert, update, or remove nodes/edges according to the user's instructions.
                3. For new nodes, assign reasonable X and Y coordinates that prevent overlap and integrate seamlessly into the current layout flow.
                4. Maintain standard node types: "client", "gateway", "service", "database", "queue".
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
