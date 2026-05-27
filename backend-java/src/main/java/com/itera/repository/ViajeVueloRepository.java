package com.itera.repository;

import com.itera.model.ViajeVuelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository de vuelos por viaje.
 */
@Repository
public interface ViajeVueloRepository extends JpaRepository<ViajeVuelo, String> {

    List<ViajeVuelo> findByViajeIdOrderByDirectionAscOrdenAsc(String viajeId);

    void deleteByViajeId(String viajeId);
}
