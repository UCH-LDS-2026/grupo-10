package com.itera.repository;

import com.itera.model.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository de viajes.
 */
@Repository
public interface ViajeRepository extends JpaRepository<Viaje, String> {

    // Listar viajes por creador (equivalente a .filter(Viaje.creador_id == creador_id))
    List<Viaje> findByCreadorId(String creadorId);
}
