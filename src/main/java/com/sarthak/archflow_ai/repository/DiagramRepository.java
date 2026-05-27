package com.sarthak.archflow_ai.repository;

import com.sarthak.archflow_ai.entity.Diagram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiagramRepository extends JpaRepository<Diagram, UUID> {
    List<Diagram> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
