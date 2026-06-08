package com.itera.service;

import com.itera.dto.ResenaDTO;
import com.itera.model.Resena;
import com.itera.model.Usuario;
import com.itera.repository.ResenaRepository;
import com.itera.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ResenaService.
 * Se mockean los repositorios para aislar la lógica de negocio.
 */
@ExtendWith(MockitoExtension.class)
class ResenaServiceTest {

    @Mock
    private ResenaRepository resenaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ResenaService resenaService;

    // ── Helper para crear un Usuario de prueba ──
    private Usuario crearUsuarioTest() {
        return Usuario.builder()
                .id("user-123")
                .nombre("Juan")
                .apellido("Pérez")
                .username("juanp")
                .email("juan@test.com")
                .hashedPassword("$2a$10$hashedpassword")
                .build();
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 1: Crear reseña exitosamente
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("crear() — debe crear una reseña y devolver el response con datos del usuario")
    void crearResena_exitoso() {
        // Arrange
        Usuario usuario = crearUsuarioTest();
        ResenaDTO.ResenaCreate request = ResenaDTO.ResenaCreate.builder()
                .atraccionId("atraccion-456")
                .usuarioId("user-123")
                .rating(5)
                .comentario("¡Excelente lugar!")
                .build();

        when(usuarioRepository.findById("user-123")).thenReturn(Optional.of(usuario));
        when(resenaRepository.save(any(Resena.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ResenaDTO.ResenaResponse response = resenaService.crear(request);

        // Assert
        assertNotNull(response);
        assertEquals("atraccion-456", response.getAtraccionId());
        assertEquals("user-123", response.getUsuarioId());
        assertEquals(5, response.getRating());
        assertEquals("¡Excelente lugar!", response.getComentario());
        assertEquals("Juan Pérez", response.getUsuarioNombre());
        assertNotNull(response.getId()); // UUID generado

        verify(usuarioRepository).findById("user-123");
        verify(resenaRepository).save(any(Resena.class));
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 2: Crear reseña con usuario inexistente lanza excepción
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("crear() — debe lanzar NOT_FOUND si el usuario no existe")
    void crearResena_usuarioNoExiste_lanzaExcepcion() {
        // Arrange
        ResenaDTO.ResenaCreate request = ResenaDTO.ResenaCreate.builder()
                .atraccionId("atraccion-456")
                .usuarioId("usuario-inexistente")
                .rating(3)
                .comentario("Test")
                .build();

        when(usuarioRepository.findById("usuario-inexistente")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> resenaService.crear(request)
        );

        assertTrue(exception.getMessage().contains("Usuario no encontrado"));
        verify(resenaRepository, never()).save(any());
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 3: Obtener reseñas por atracción
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("obtenerPorAtraccion() — debe devolver lista de reseñas mapeadas a DTO")
    void obtenerPorAtraccion_devuelveListaMapeada() {
        // Arrange
        Usuario usuario = crearUsuarioTest();
        Resena resena1 = Resena.builder()
                .id("resena-1")
                .atraccionId("atraccion-789")
                .usuarioId("user-123")
                .rating(4)
                .comentario("Muy bueno")
                .fecha(LocalDateTime.now())
                .build();
        Resena resena2 = Resena.builder()
                .id("resena-2")
                .atraccionId("atraccion-789")
                .usuarioId("user-123")
                .rating(5)
                .comentario("Increíble")
                .fecha(LocalDateTime.now())
                .build();

        when(resenaRepository.findByAtraccionIdOrderByFechaDesc("atraccion-789"))
                .thenReturn(List.of(resena1, resena2));
        when(usuarioRepository.findById("user-123")).thenReturn(Optional.of(usuario));

        // Act
        List<ResenaDTO.ResenaResponse> resultado = resenaService.obtenerPorAtraccion("atraccion-789");

        // Assert
        assertEquals(2, resultado.size());
        assertEquals("Muy bueno", resultado.get(0).getComentario());
        assertEquals("Increíble", resultado.get(1).getComentario());
        assertEquals("Juan Pérez", resultado.get(0).getUsuarioNombre());

        verify(resenaRepository).findByAtraccionIdOrderByFechaDesc("atraccion-789");
    }
}
