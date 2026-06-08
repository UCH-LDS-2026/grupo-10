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
}
