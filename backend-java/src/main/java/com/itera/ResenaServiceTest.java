package com.itera.service;

import com.itera.dto.ResenaDTO;
import com.itera.model.Resena;
import com.itera.model.Usuario;
import com.itera.repository.ResenaRepository;
import com.itera.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "spring.flyway.validate-on-migrate=false")
class ResenaServiceTest {

    @MockBean
    private ResenaRepository resenaRepository;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ResenaService resenaService;

    @Test
    @DisplayName("crear() — debe crear una reseña exitosamente")
    void crearResena_exitoso() {
        Usuario usuario = Usuario.builder()
                .id("user-123")
                .nombre("Juan")
                .apellido("Pérez")
                .username("juanp")
                .email("juan@test.com")
                .build();

        ResenaDTO.ResenaCreate request = ResenaDTO.ResenaCreate.builder()
                .atraccionId("atraccion-456")
                .usuarioId("user-123")
                .rating(5)
                .comentario("¡Excelente lugar!")
                .build();

        when(usuarioRepository.findById("user-123")).thenReturn(Optional.of(usuario));
        when(resenaRepository.save(any(Resena.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResenaDTO.ResenaResponse response = resenaService.crear(request);

        assertNotNull(response);
        assertEquals("atraccion-456", response.getAtraccionId());
        assertEquals(5, response.getRating());

        verify(resenaRepository).save(any(Resena.class));
    }
}
