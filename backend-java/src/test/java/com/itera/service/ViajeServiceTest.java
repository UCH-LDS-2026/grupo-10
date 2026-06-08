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
}
