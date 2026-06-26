package com.itera.repository;

import com.itera.model.ViajeAuto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository de alquiler de autos por viaje.
 */
@Repository
public interface ViajeAutoRepository extends JpaRepository<ViajeAuto, String> {

    List<ViajeAuto> findByViajeIdOrderByOrdenAsc(String viajeId);

    void deleteByViajeId(String viajeId);
}
