package com.itera.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTOs del módulo de viajes.
 * Se usan @JsonProperty para que el JSON en/saliente use snake_case
 * igual que en el frontend React / sistema Python anterior.
 */
public class ViajeDTO {

    /** Request para crear un viaje */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViajeCreate {
        @NotBlank(message = "El nombre del viaje es obligatorio")
        private String nombre;

        @JsonProperty("destino_principal")
        @NotBlank(message = "El destino principal es obligatorio")
        private String destinoPrincipal;

        @JsonProperty("fecha_inicio")
        private LocalDate fechaInicio;

        @JsonProperty("fecha_fin")
        private LocalDate fechaFin;

        @JsonProperty("creador_id")
        @NotBlank(message = "El creador_id es obligatorio")
        private String creadorId;

        @JsonProperty("foto_url")
        private String fotoUrl;

        @JsonProperty("es_privado")
        private Boolean esPrivado = false;
    }

    /** Response de viaje */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ViajeResponse {
        private String id;
        private String nombre;

        @JsonProperty("destino_principal")
        private String destinoPrincipal;

        @JsonProperty("fecha_inicio")
        private LocalDate fechaInicio;

        @JsonProperty("fecha_fin")
        private LocalDate fechaFin;

        @JsonProperty("creador_id")
        private String creadorId;

        private String estado;

        @JsonProperty("foto_url")
        private String fotoUrl;

        @JsonProperty("es_privado")
        private Boolean esPrivado = false;
        
        // Atributos adicionales para cuando se devuelve un viaje compartido
        private String rol;

        @JsonProperty("creador_nombre")
        private String creadorNombre;

        @JsonProperty("creador_username")
        private String creadorUsername;

        @JsonProperty("compartido_con_otros")
        private Boolean compartidoConOtros = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvitacionCreate {
        @JsonProperty("usuario_id")
        @NotBlank(message = "El usuario_id es obligatorio")
        private String usuarioId;

        private String rol = "LECTOR";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvitacionStatus {
        @NotBlank(message = "El estado es obligatorio")
        private String estado;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvitacionResponse {
        @JsonProperty("viaje_id")
        private String viajeId;
        
        @JsonProperty("viaje_nombre")
        private String viajeNombre;
        
        @JsonProperty("viaje_foto")
        private String viajeFoto;
        
        @JsonProperty("creador_nombre")
        private String creadorNombre;
        
        @JsonProperty("creador_username")
        private String creadorUsername;
        
        @JsonProperty("usuario_id")
        private String usuarioId;
        
        private String rol;
        private String estado;
    }
}
