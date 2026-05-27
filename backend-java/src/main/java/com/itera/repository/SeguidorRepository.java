package com.itera.repository;

import com.itera.model.Seguidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeguidorRepository extends JpaRepository<Seguidor, Seguidor.SeguidorId> {
    List<Seguidor> findByIdSeguidorId(String seguidorId);
    List<Seguidor> findByIdSeguidoId(String seguidoId);
    boolean existsByIdSeguidorIdAndIdSeguidoId(String seguidorId, String seguidoId);
    long countByIdSeguidorId(String seguidorId);
    long countByIdSeguidoId(String seguidoId);
}
