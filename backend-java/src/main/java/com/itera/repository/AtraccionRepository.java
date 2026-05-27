package com.itera.repository;

import com.itera.model.Atraccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository de atracciones.
 */
@Repository
public interface AtraccionRepository extends JpaRepository<Atraccion, String> {

    // Búsqueda ILIKE por nombre o dirección (equivalente a .ilike(f"%{q}%"))
    @Query("SELECT a FROM Atraccion a WHERE LOWER(a.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.direccion) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Atraccion> searchByNombre(@Param("q") String q);

    List<Atraccion> findByCreadorId(String creadorId);
}
