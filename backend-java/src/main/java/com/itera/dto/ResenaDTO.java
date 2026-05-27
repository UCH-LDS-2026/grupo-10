package com.itera.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ResenaDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResenaCreate {
        @NotBlank(message = "El ID de la atracción no puede estar vacío")
        private String atraccionId;

        @NotBlank(message = "El ID del usuario no puede estar vacío")
        private String usuarioId;

        @NotNull(message = "El rating no puede estar vacío")
        @Min(value = 1, message = "El rating mínimo es 1")
        @Max(value = 5, message = "El rating máximo es 5")
        private Integer rating;

        private String comentario;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResenaResponse {
        private String id;
        private String atraccionId;
        private String usuarioId;
        private Integer rating;
        private String comentario;
        private LocalDateTime fecha;
        // Campos adicionales útiles para el frontend
        private String usuarioNombre;
        private String usuarioFoto;
    }
}
