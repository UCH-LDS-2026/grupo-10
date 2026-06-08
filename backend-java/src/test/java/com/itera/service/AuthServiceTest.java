package com.itera.service;

import com.itera.dto.AuthDTO;
import com.itera.model.Usuario;
import com.itera.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para AuthService.
 * Se mockea UsuarioRepository para aislar la lógica de autenticación.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthService authService;

    // ══════════════════════════════════════════════════════════════════
    // TEST 1: Registro exitoso
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("register() — debe registrar un usuario nuevo y devolver respuesta sin contraseña")
    void register_exitoso() {
        // Arrange
        AuthDTO.UsuarioCreate request = new AuthDTO.UsuarioCreate();
        request.setNombre("María");
        request.setApellido("García");
        request.setEmail("maria@test.com");
        request.setUsername("mariag");
        request.setPassword("password123");
        request.setNacionalidad("Argentina");
        request.setEdad(25);

        when(usuarioRepository.existsByEmail("maria@test.com")).thenReturn(false);
        when(usuarioRepository.existsByUsername("mariag")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        AuthDTO.UsuarioResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("María", response.getNombre());
        assertEquals("García", response.getApellido());
        assertEquals("maria@test.com", response.getEmail());
        assertEquals("mariag", response.getUsername());
        assertEquals("Argentina", response.getNacionalidad());
        assertTrue(response.getVerificado()); // Auto-verificado en MVP
        assertNotNull(response.getId()); // UUID generado

        verify(usuarioRepository).save(any(Usuario.class));
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 2: Registro con email duplicado lanza excepción
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("register() — debe lanzar BAD_REQUEST si el email ya está registrado")
    void register_emailDuplicado_lanzaExcepcion() {
        // Arrange
        AuthDTO.UsuarioCreate request = new AuthDTO.UsuarioCreate();
        request.setNombre("Test");
        request.setApellido("User");
        request.setEmail("existente@test.com");
        request.setUsername("testuser");
        request.setPassword("pass123");

        when(usuarioRepository.existsByEmail("existente@test.com")).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(request)
        );

        assertTrue(exception.getMessage().contains("email ya está registrado"));
        verify(usuarioRepository, never()).save(any());
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 3: Login con credenciales incorrectas lanza excepción
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("login() — debe lanzar UNAUTHORIZED si el usuario no existe")
    void login_usuarioNoExiste_lanzaExcepcion() {
        // Arrange
        AuthDTO.UsuarioLogin request = new AuthDTO.UsuarioLogin();
        request.setEmail("noexiste@test.com");
        request.setPassword("password123");

        when(usuarioRepository.findByEmail("noexiste@test.com")).thenReturn(Optional.empty());
        when(usuarioRepository.findByUsername("noexiste@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(request)
        );

        assertTrue(exception.getMessage().contains("Credenciales incorrectas"));
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 4: Login exitoso con contraseña correcta
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("login() — debe devolver usuario si las credenciales son válidas")
    void login_exitoso() {
        // Arrange
        // Primero registramos para obtener un hash real de BCrypt
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String hashedPassword = encoder.encode("miPassword123");

        Usuario usuario = Usuario.builder()
                .id("user-abc")
                .nombre("Carlos")
                .apellido("López")
                .username("carlosl")
                .email("carlos@test.com")
                .hashedPassword(hashedPassword)
                .verificado(true)
                .build();

        AuthDTO.UsuarioLogin request = new AuthDTO.UsuarioLogin();
        request.setEmail("carlos@test.com");
        request.setPassword("miPassword123");

        when(usuarioRepository.findByEmail("carlos@test.com")).thenReturn(Optional.of(usuario));

        // Act
        AuthDTO.UsuarioResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("Carlos", response.getNombre());
        assertEquals("López", response.getApellido());
        assertEquals("carlos@test.com", response.getEmail());
        assertEquals("carlosl", response.getUsername());
    }
}
