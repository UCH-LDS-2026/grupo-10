package com.itera.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTOs del módulo de itinerario.
 * @JsonProperty garantiza snake_case en JSON — igual que schemas.py de Python.
 */
public class ItemItinerarioDTO {

    /** Request para agregar un item al itinerario */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemCreate {
        @JsonProperty("atraccion_id")
        @NotBlank(message = "El atraccion_id es obligatorio")
        private String atraccionId;

        @JsonProperty("fecha_asignada")
        private LocalDate fechaAsignada;

        @JsonProperty("hora_inicio")
        private LocalTime horaInicio;

        @JsonProperty("hora_fin")
        private LocalTime horaFin;

        @JsonProperty("transporte_prox_tipo")
        private String transporteProxTipo;

        @JsonProperty("transporte_prox_duracion")
        private Float transporteProxDuracion;
    }

    /** Response de un item del itinerario */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private String id;

        @JsonProperty("viaje_id")
        private String viajeId;

        @JsonProperty("atraccion_id")
        private String atraccionId;

        @JsonProperty("atraccion_nombre")
        private String atraccionNombre;

        @JsonProperty("fecha_asignada")
        private LocalDate fechaAsignada;

        @JsonProperty("hora_inicio")
        private LocalTime horaInicio;

        @JsonProperty("hora_fin")
        private LocalTime horaFin;

        @JsonProperty("transporte_prox_tipo")
        private String transporteProxTipo;

        @JsonProperty("transporte_prox_duracion")
        private Float transporteProxDuracion;

        @JsonProperty("foto_url")
        private String fotoUrl;

        private String direccion;
        private Double rating;
        private String categoria;

        @JsonProperty("google_place_id")
        private String googlePlaceId;
    }
}
