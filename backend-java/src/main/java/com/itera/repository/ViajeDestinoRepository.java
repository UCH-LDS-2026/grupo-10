package com.itera.repository;

import com.itera.model.ViajeDestino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository de destinos por viaje.
 */
@Repository
public interface ViajeDestinoRepository extends JpaRepository<ViajeDestino, String> {

    List<ViajeDestino> findByViajeIdOrderByOrdenAsc(String viajeId);

    void deleteByViajeId(String viajeId);
}
