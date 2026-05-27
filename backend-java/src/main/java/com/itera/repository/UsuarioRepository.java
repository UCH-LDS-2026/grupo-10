package com.itera.repository;

import com.itera.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository de usuarios.
 * Equivalente a las queries db.query(models.Usuario).filter(...) de SQLAlchemy.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    // Buscar por email (para login/registro)
    Optional<Usuario> findByEmail(String email);

    // Buscar por username (para login/registro)
    Optional<Usuario> findByUsername(String username);

    // Buscar por email OR username (para validar duplicados al registrar)
    Optional<Usuario> findByEmailOrUsername(String email, String username);

    // Buscar por token de verificación
    Optional<Usuario> findByTokenVerificacion(String token);

    // Verificar si existe un email o username (para registro)
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    // Buscar usuarios por username, nombre o apellido (ignoring case)
    List<Usuario> findByUsernameContainingIgnoreCaseOrNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String username, String nombre, String apellido);
}
