package com.sarthak.archflow_ai.ai;

public interface AIProvider {
    String getName();
    String generateDiagram(String prompt, String systemPrompt);
}
