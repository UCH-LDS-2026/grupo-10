package com.itera.repository;

import com.itera.model.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, String> {
    List<Resena> findByAtraccionIdOrderByFechaDesc(String atraccionId);
    List<Resena> findByUsuarioIdOrderByFechaDesc(String usuarioId);
}
