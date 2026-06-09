package com.itera.service;

import com.itera.dto.AuthDTO;
import com.itera.model.Usuario;
import com.itera.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "spring.flyway.validate-on-migrate=false")
class AuthServiceTest {

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("register() — debe registrar un usuario nuevo exitosamente")
    void register_exitoso() {
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

        AuthDTO.UsuarioResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("María", response.getNombre());
        assertEquals("maria@test.com", response.getEmail());

        verify(usuarioRepository).save(any(Usuario.class));
    }
}
