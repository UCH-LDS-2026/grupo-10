package com.itera.repository;

import com.itera.model.ViajeUsuario;
import com.itera.model.ViajeUsuarioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViajeUsuarioRepository extends JpaRepository<ViajeUsuario, ViajeUsuarioId> {
    
    List<ViajeUsuario> findByIdUsuarioIdAndEstado(String usuarioId, String estado);
    
    List<ViajeUsuario> findByIdViajeIdAndEstado(String viajeId, String estado);
    
    Optional<ViajeUsuario> findByIdViajeIdAndIdUsuarioId(String viajeId, String usuarioId);
    
    boolean existsByIdViajeId(String viajeId);
}
