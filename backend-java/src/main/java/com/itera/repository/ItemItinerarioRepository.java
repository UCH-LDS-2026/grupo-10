package com.itera.repository;

import com.itera.model.ItemItinerario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository de items del itinerario.
 */
@Repository
public interface ItemItinerarioRepository extends JpaRepository<ItemItinerario, String> {

    // Obtener todos los items de un viaje específico
    List<ItemItinerario> findByViajeId(String viajeId);
}
