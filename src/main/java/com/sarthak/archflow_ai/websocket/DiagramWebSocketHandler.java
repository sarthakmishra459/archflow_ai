package com.sarthak.archflow_ai.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sarthak.archflow_ai.entity.Diagram;
import com.sarthak.archflow_ai.repository.DiagramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
@Slf4j
public class DiagramWebSocketHandler extends TextWebSocketHandler {

    private final DiagramRepository diagramRepository;
    private final ObjectMapper objectMapper;

    // Maps diagram ID -> set of active web socket sessions
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String diagramId = getDiagramId(session);
        if (diagramId == null) {
            try {
                session.close(CloseStatus.BAD_DATA);
            } catch (IOException e) {
                log.error("Failed to close invalid session: ", e);
            }
            return;
        }

        roomSessions.computeIfAbsent(diagramId, k -> new CopyOnWriteArraySet<>()).add(session);
        log.info("WebSocket connection established for room: {}. Active sessions in room: {}", 
                diagramId, roomSessions.get(diagramId).size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String diagramId = getDiagramId(session);
        if (diagramId == null) return;

        String payload = message.getPayload();
        JsonNode jsonNode = objectMapper.readTree(payload);
        String type = jsonNode.path("type").asText();

        if ("GRAPH_CHANGE".equals(type)) {
            String graphJson = jsonNode.path("graphJson").toString();
            
            // Broadcast to other sessions in the room
            broadcastToRoom(diagramId, session, message);
            
            // Background autosave to PostgreSQL database
            autosaveDiagram(diagramId, graphJson);
        } else if ("CURSOR_MOVE".equals(type)) {
            // Broadcast cursors instantly to render multiplayer cursors in Next.js
            broadcastToRoom(diagramId, session, message);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String diagramId = getDiagramId(session);
        if (diagramId != null) {
            Set<WebSocketSession> sessions = roomSessions.get(diagramId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    roomSessions.remove(diagramId);
                }
                log.info("Session closed for room: {}. Remaining sessions: {}", 
                        diagramId, sessions == null ? 0 : sessions.size());
            }
        }
    }

    private void broadcastToRoom(String diagramId, WebSocketSession sender, TextMessage message) {
        Set<WebSocketSession> sessions = roomSessions.get(diagramId);
        if (sessions == null) return;

        for (WebSocketSession s : sessions) {
            if (s.isOpen() && !s.getId().equals(sender.getId())) {
                try {
                    s.sendMessage(message);
                } catch (IOException e) {
                    log.error("Error broadcasting message: ", e);
                }
            }
        }
    }

    private void autosaveDiagram(String diagramId, String graphJson) {
        try {
            UUID id = UUID.fromString(diagramId);
            Optional<Diagram> opt = diagramRepository.findById(id);
            if (opt.isPresent()) {
                Diagram diagram = opt.get();
                diagram.setGraphJson(graphJson);
                diagramRepository.save(diagram);
            }
        } catch (Exception e) {
            log.error("Failed to perform background autosave: ", e);
        }
    }

    private String getDiagramId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null || uri.getQuery() == null) return null;
        
        // Find diagramId=... in query parameters
        return Arrays.stream(uri.getQuery().split("&"))
                .map(param -> param.split("="))
                .filter(pairs -> pairs.length == 2 && "diagramId".equals(pairs[0]))
                .map(pairs -> pairs[1])
                .findFirst()
                .orElse(null);
    }
}
