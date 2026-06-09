package com.itera.service;

import com.itera.dto.ViajeDTO;
import com.itera.model.Viaje;
import com.itera.repository.ViajeRepository;
import com.itera.repository.ItemItinerarioRepository;
import com.itera.repository.AtraccionRepository;
import com.itera.repository.ViajeDestinoRepository;
import com.itera.repository.ViajeVueloRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "spring.flyway.validate-on-migrate=false")
class ViajeServiceTest {

    @MockBean private ViajeRepository viajeRepository;
    @MockBean private ItemItinerarioRepository itemRepository;
    @MockBean private AtraccionRepository atraccionRepository;
    @MockBean private ViajeDestinoRepository destinoRepository;
    @MockBean private ViajeVueloRepository vueloRepository;
    @MockBean private PlacesService placesService;

    @Autowired
    private ViajeService viajeService;

    @Test
    @DisplayName("crearViaje() — debe crear un viaje exitosamente")
    void crearViaje_exitoso() {
        ViajeDTO.ViajeCreate request = new ViajeDTO.ViajeCreate();
        request.setNombre("Viaje a Europa");
        request.setDestinoPrincipal("París");
        request.setFechaInicio(LocalDate.of(2026, 7, 1));
        request.setFechaFin(LocalDate.of(2026, 7, 15));
        request.setCreadorId("user-abc");
        request.setEsPrivado(false);

        when(viajeRepository.save(any(Viaje.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ViajeDTO.ViajeResponse response = viajeService.crearViaje(request);

        assertNotNull(response);
        assertEquals("Viaje a Europa", response.getNombre());
        assertEquals("París", response.getDestinoPrincipal());

        verify(viajeRepository).save(any(Viaje.class));
    }
}
