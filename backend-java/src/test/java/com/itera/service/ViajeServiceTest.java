package com.itera.service;

import com.itera.dto.ViajeDTO;
import com.itera.model.Viaje;
import com.itera.repository.AtraccionRepository;
import com.itera.repository.ItemItinerarioRepository;
import com.itera.repository.ViajeDestinoRepository;
import com.itera.repository.ViajeRepository;
import com.itera.repository.ViajeVueloRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ViajeService.
 * Se mockean los repositorios para aislar la lógica de negocio de viajes.
 */
@ExtendWith(MockitoExtension.class)
class ViajeServiceTest {

    @Mock
    private ViajeRepository viajeRepository;

    @Mock
    private ItemItinerarioRepository itemRepository;

    @Mock
    private AtraccionRepository atraccionRepository;

    @Mock
    private ViajeDestinoRepository destinoRepository;

    @Mock
    private ViajeVueloRepository vueloRepository;

    @Mock
    private PlacesService placesService;

    @InjectMocks
    private ViajeService viajeService;

    // ══════════════════════════════════════════════════════════════════
    // TEST 1: Crear viaje exitosamente
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("crearViaje() — debe crear un viaje y devolver response con datos correctos")
    void crearViaje_exitoso() {
        // Arrange
        ViajeDTO.ViajeCreate request = new ViajeDTO.ViajeCreate();
        request.setNombre("Viaje a Europa");
        request.setDestinoPrincipal("París");
        request.setFechaInicio(LocalDate.of(2026, 7, 1));
        request.setFechaFin(LocalDate.of(2026, 7, 15));
        request.setCreadorId("user-abc");
        request.setFotoUrl("https://example.com/paris.jpg");
        request.setEsPrivado(false);

        when(viajeRepository.save(any(Viaje.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ViajeDTO.ViajeResponse response = viajeService.crearViaje(request);

        // Assert
        assertNotNull(response);
        assertEquals("Viaje a Europa", response.getNombre());
        assertEquals("París", response.getDestinoPrincipal());
        assertEquals(LocalDate.of(2026, 7, 1), response.getFechaInicio());
        assertEquals(LocalDate.of(2026, 7, 15), response.getFechaFin());
        assertEquals("user-abc", response.getCreadorId());
        assertEquals("En Planificación", response.getEstado());
        assertNotNull(response.getId()); // UUID generado
        assertFalse(response.getEsPrivado());

        verify(viajeRepository).save(any(Viaje.class));
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 2: Listar viajes sin creador_id lanza excepción
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("listarViajes() — debe lanzar BAD_REQUEST si creadorId es null o vacío")
    void listarViajes_sinCreadorId_lanzaExcepcion() {
        // Act & Assert — null
        ResponseStatusException ex1 = assertThrows(
                ResponseStatusException.class,
                () -> viajeService.listarViajes(null)
        );
        assertTrue(ex1.getMessage().contains("creador_id"));

        // Act & Assert — vacío
        ResponseStatusException ex2 = assertThrows(
                ResponseStatusException.class,
                () -> viajeService.listarViajes("   ")
        );
        assertTrue(ex2.getMessage().contains("creador_id"));
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 3: Eliminar viaje que no existe lanza NOT_FOUND
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("eliminarViaje() — debe lanzar NOT_FOUND si el viaje no existe")
    void eliminarViaje_noExiste_lanzaExcepcion() {
        // Arrange
        when(viajeRepository.findById("viaje-inexistente")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> viajeService.eliminarViaje("viaje-inexistente")
        );

        assertTrue(exception.getMessage().contains("Viaje no encontrado"));
        verify(viajeRepository, never()).delete(any());
    }

    // ══════════════════════════════════════════════════════════════════
    // TEST 4: Listar viajes de un creador devuelve lista correcta
    // ══════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("listarViajes() — debe devolver lista de viajes mapeados a DTO")
    void listarViajes_devuelveListaMapeada() {
        // Arrange
        Viaje viaje1 = Viaje.builder()
                .id("v1")
                .nombre("Viaje a Roma")
                .destinoPrincipal("Roma")
                .fechaInicio(LocalDate.of(2026, 8, 1))
                .fechaFin(LocalDate.of(2026, 8, 10))
                .creadorId("user-xyz")
                .estado("En Planificación")
                .esPrivado(false)
                .build();
        Viaje viaje2 = Viaje.builder()
                .id("v2")
                .nombre("Viaje a Tokio")
                .destinoPrincipal("Tokio")
                .fechaInicio(LocalDate.of(2026, 9, 1))
                .fechaFin(LocalDate.of(2026, 9, 20))
                .creadorId("user-xyz")
                .estado("En Planificación")
                .esPrivado(true)
                .build();

        when(viajeRepository.findByCreadorId("user-xyz")).thenReturn(List.of(viaje1, viaje2));

        // Act
        List<ViajeDTO.ViajeResponse> resultado = viajeService.listarViajes("user-xyz");

        // Assert
        assertEquals(2, resultado.size());
        assertEquals("Viaje a Roma", resultado.get(0).getNombre());
        assertEquals("Viaje a Tokio", resultado.get(1).getNombre());
        assertTrue(resultado.get(1).getEsPrivado());
        assertFalse(resultado.get(0).getEsPrivado());

        verify(viajeRepository).findByCreadorId("user-xyz");
    }
}
