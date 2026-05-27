package com.sarthak.archflow_ai.dto;

import java.util.UUID;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private UUID userId;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, String username, String email, UUID userId) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.userId = userId;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    // Builder
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String username;
        private String email;
        private UUID userId;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder userId(UUID userId) { this.userId = userId; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, username, email, userId);
        }
    }
}
