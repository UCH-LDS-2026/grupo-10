package com.itera.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTOs del módulo de atracciones.
 * @JsonProperty garantiza snake_case en JSON — igual que schemas.py de Python.
 */
public class AtraccionDTO {

    /** Request para crear una atracción */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AtraccionCreate {
        @NotBlank(message = "El id es obligatorio")
        private String id;

        @NotBlank(message = "El nombre es obligatorio")
        private String nombre;

        private String descripcion;
        private BigDecimal latitud;
        private BigDecimal longitud;
        private BigDecimal costo = BigDecimal.ZERO;

        @JsonProperty("necesita_turno")
        private Boolean necesitaTurno = false;

        @JsonProperty("es_oficial")
        private Boolean esOficial = false;

        @JsonProperty("foto_url")
        private String fotoUrl;

        private String direccion;
        private Double rating;
        private String categoria;

        @JsonProperty("google_place_id")
        private String googlePlaceId;

        @JsonProperty("creador_id")
        private String creadorId;

        private String accesibilidad;
    }

    /** Response de atracción */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtraccionResponse {
        private String id;
        private String nombre;
        private String descripcion;
        private BigDecimal latitud;
        private BigDecimal longitud;
        private BigDecimal costo;

        @JsonProperty("necesita_turno")
        private Boolean necesitaTurno;

        @JsonProperty("es_oficial")
        private Boolean esOficial;

        @JsonProperty("foto_url")
        private String fotoUrl;

        private String direccion;
        private Double rating;
        private String categoria;

        @JsonProperty("google_place_id")
        private String googlePlaceId;

        @JsonProperty("creador_id")
        private String creadorId;

        private String accesibilidad;
    }
}
