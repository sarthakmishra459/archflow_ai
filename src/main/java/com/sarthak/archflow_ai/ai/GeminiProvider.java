package com.sarthak.archflow_ai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GeminiProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiProvider.class);

    private final String apiKey;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiProvider(
            @Value("${archflow.ai.gemini.api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String getName() {
        return "GEMINI";
    }

    @Override
    public String generateDiagram(String prompt, String systemPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is missing. Returning simulated diagram response.");
            return getFallbackDiagram(prompt);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            // Build request JSON
            ObjectNode rootNode = objectMapper.createObjectNode();
            
            // Contents
            ArrayNode contentsNode = rootNode.putArray("contents");
            ObjectNode contentObj = contentsNode.addObject();
            contentObj.put("role", "user");
            ArrayNode partsNode = contentObj.putArray("parts");
            partsNode.addObject().put("text", systemPrompt + "\n\nUser request: " + prompt);
            
            // Generation Config for JSON response
            ObjectNode genConfig = rootNode.putObject("generationConfig");
            genConfig.put("responseMimeType", "application/json");

            String requestBody = objectMapper.writeValueAsString(rootNode);

            String responseBody = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            // Parse response
            ObjectNode responseJson = (ObjectNode) objectMapper.readTree(responseBody);
            String responseText = responseJson.at("/candidates/0/content/parts/0/text").asText();

            return responseText;

        } catch (Exception e) {
            log.error("Error generating diagram from Gemini API: ", e);
            return getFallbackDiagram(prompt);
        }
    }

    private String getFallbackDiagram(String prompt) {
        log.info("Generating intelligent mock diagram response for prompt: {}", prompt);
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ArrayNode nodes = root.putArray("nodes");
            ArrayNode edges = root.putArray("edges");

            boolean isCI = prompt.toLowerCase().contains("ci/cd") || prompt.toLowerCase().contains("pipeline");
            boolean isServerless = prompt.toLowerCase().contains("serverless");

            if (isCI) {
                // Next.js CI/CD Flow
                addNode(nodes, "node-1", "Developer Push", "client", 100, 150);
                addNode(nodes, "node-2", "GitHub Actions", "service", 300, 150);
                addNode(nodes, "node-3", "AWS CodeBuild", "service", 500, 150);
                addNode(nodes, "node-4", "Vercel / S3 Deployment", "gateway", 700, 150);

                addEdge(edges, "edge-1", "node-1", "node-2", "Triggers webhook");
                addEdge(edges, "edge-2", "node-2", "node-3", "Starts build job");
                addEdge(edges, "edge-3", "node-3", "node-4", "Pushes build assets");
            } else if (isServerless) {
                // Serverless design
                addNode(nodes, "node-1", "User Client", "client", 100, 200);
                addNode(nodes, "node-2", "Amazon API Gateway", "gateway", 300, 200);
                addNode(nodes, "node-3", "Lambda (Auth Service)", "service", 550, 100);
                addNode(nodes, "node-4", "Lambda (Payment Service)", "service", 550, 300);
                addNode(nodes, "node-5", "DynamoDB Table", "database", 800, 200);

                addEdge(edges, "edge-1", "node-1", "node-2", "HTTPS API Call");
                addEdge(edges, "edge-2", "node-2", "node-3", "Routes /auth");
                addEdge(edges, "edge-3", "node-2", "node-4", "Routes /pay");
                addEdge(edges, "edge-4", "node-3", "node-5", "Read/Write Users");
                addEdge(edges, "edge-5", "node-4", "node-5", "Log Transactions");
            } else {
                // Microservices / E-commerce architecture (standard default)
                addNode(nodes, "node-1", "Browser / App Client", "client", 50, 200);
                addNode(nodes, "node-2", "Kong API Gateway", "gateway", 250, 200);
                addNode(nodes, "node-3", "Auth Service", "service", 450, 100);
                addNode(nodes, "node-4", "Order Microservice", "service", 450, 300);
                addNode(nodes, "node-5", "Redis cache", "queue", 650, 100);
                addNode(nodes, "node-6", "PostgreSQL database", "database", 650, 300);

                addEdge(edges, "edge-1", "node-1", "node-2", "HTTPS Requests");
                addEdge(edges, "edge-2", "node-2", "node-3", "Validates JWT Token");
                addEdge(edges, "edge-3", "node-2", "node-4", "Proxies checkout request");
                addEdge(edges, "edge-4", "node-3", "node-5", "Caches session details");
                addEdge(edges, "edge-5", "node-4", "node-6", "Persists order status");
            }

            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
        } catch (Exception e) {
            return "{\"nodes\":[], \"edges\":[]}";
        }
    }

    private void addNode(ArrayNode nodes, String id, String label, String type, double x, double y) {
        ObjectNode node = nodes.addObject();
        node.put("id", id);
        node.put("type", type);
        node.put("label", label);
        ObjectNode pos = node.putObject("position");
        pos.put("x", x);
        pos.put("y", y);
    }

    private void addEdge(ArrayNode edges, String id, String source, String target, String label) {
        ObjectNode edge = edges.addObject();
        edge.put("id", id);
        edge.put("source", source);
        edge.put("target", target);
        edge.put("label", label);
    }
}
