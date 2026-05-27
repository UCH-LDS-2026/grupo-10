package com.itera.service;

import com.itera.dto.AuthDTO;
import com.itera.model.Usuario;
import com.itera.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Servicio de autenticación.
 * Equivalente a auth_router.py de FastAPI (hash_password, verify_password, register, login, verify).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    // BCryptPasswordEncoder es 100% compatible con los hashes $2b$12$... generados por passlib/bcrypt de Python
    // No es final inyectado (Lombok la ignoraría al tener valor inicial) — static es correcto aquí
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Registra un nuevo usuario.
     * Equivalente a POST /api/auth/register de Python.
     */
    public AuthDTO.UsuarioResponse register(AuthDTO.UsuarioCreate request) {
        // Verificar si email o username ya existen
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está registrado");
        }
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El username ya está registrado");
        }

        // Manejar edad inválida (igual que Python: if edad <= 0: edad = None)
        Integer edad = request.getEdad();
        if (edad != null && edad <= 0) {
            edad = null;
        }

        java.time.LocalDate fechaNac = null;
        if (request.getFechaNacimiento() != null && !request.getFechaNacimiento().isBlank()) {
            try {
                fechaNac = java.time.LocalDate.parse(request.getFechaNacimiento());
            } catch (Exception e) {
                System.err.println("[AuthService] Error al parsear fecha_nacimiento: " + e.getMessage());
            }
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        String verificationToken = UUID.randomUUID().toString();

        Usuario nuevoUsuario = Usuario.builder()
                .id(UUID.randomUUID().toString())
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .username(request.getUsername())
                .email(request.getEmail())
                .hashedPassword(hashedPassword)
                .nacionalidad(request.getNacionalidad())
                .edad(edad)
                .fechaNacimiento(fechaNac)
                .verificado(true)  // Auto-verificado para el MVP (igual que Python)
                .tokenVerificacion(verificationToken)
                .build();

        usuarioRepository.save(java.util.Objects.requireNonNull(nuevoUsuario));

        System.out.printf("[REGISTRO OK] Usuario '%s' creado exitosamente.%n", request.getUsername());

        return toResponse(nuevoUsuario);
    }

    /**
     * Login de usuario.
     * Equivalente a POST /api/auth/login de Python.
     * Acepta email o username en el campo 'email'.
     */
    public AuthDTO.UsuarioResponse login(AuthDTO.UsuarioLogin request) {
        // Buscar por email o username (el campo 'email' puede ser cualquiera de los dos)
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .or(() -> usuarioRepository.findByUsername(request.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        // Verificar contraseña con BCrypt
        if (!passwordEncoder.matches(request.getPassword(), usuario.getHashedPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        return toResponse(usuario);
    }

    /**
     * Verificación de email por token.
     * Equivalente a GET /api/auth/verify/{token} de Python.
     */
    public String verifyEmail(String token) {
        Usuario usuario = usuarioRepository.findByTokenVerificacion(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token no válido o expirado"));

        if (usuario.getVerificado()) {
            return "El correo ya estaba verificado. ¡Ya puedes iniciar sesión!";
        }

        usuario.setVerificado(true);
        usuarioRepository.save(java.util.Objects.requireNonNull(usuario));
        return "¡Correo verificado con éxito! Ya puedes volver a la aplicación e iniciar sesión.";
    }

    // -- Mapeo entidad → DTO de respuesta --
    private AuthDTO.UsuarioResponse toResponse(Usuario u) {
        return AuthDTO.UsuarioResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .email(u.getEmail())
                .username(u.getUsername())
                .nacionalidad(u.getNacionalidad())
                .edad(u.getEdad())
                .verificado(u.getVerificado())
                .fotoPerfil(u.getFotoPerfil())
                .build();
    }
}
