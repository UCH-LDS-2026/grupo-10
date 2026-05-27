package com.itera.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs del módulo de autenticación.
 * Equivalentes a los schemas Pydantic de schemas.py.
 */
public class AuthDTO {

    /** Request para registro de nuevo usuario */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioCreate {
        @NotBlank(message = "El nombre es obligatorio")
        private String nombre;

        @NotBlank(message = "El apellido es obligatorio")
        private String apellido;

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene formato válido")
        private String email;

        @NotBlank(message = "El username es obligatorio")
        private String username;

        @NotBlank(message = "La contraseña es obligatoria")
        private String password;

        private String nacionalidad;
        private Integer edad;
        private String fechaNacimiento;
    }

    /** Request para login */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioLogin {
        @NotBlank(message = "El email/username es obligatorio")
        private String email;  // puede ser email o username

        @NotBlank(message = "La contraseña es obligatoria")
        private String password;
    }

    /** Response de usuario (sin contraseña) */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UsuarioResponse {
        private String id;
        private String nombre;
        private String apellido;
        private String email;
        private String username;
        private String nacionalidad;
        private Integer edad;
        private Boolean verificado;
        private String fotoPerfil;
    }
}
