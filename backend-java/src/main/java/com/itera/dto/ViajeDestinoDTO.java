package com.itera.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs para destinos por viaje.
 * @JsonProperty garantiza snake_case en JSON.
 */
public class ViajeDestinoDTO {

    /** Request para crear/actualizar un destino */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DestinoCreate {
        @NotBlank(message = "La ciudad es obligatoria")
        private String city;

        private String country = "";

        private Integer nights = 1;

        @JsonProperty("photo_url")
        private String photoUrl;

        private Integer orden = 0;

        @JsonProperty("google_place_id")
        private String googlePlaceId;
    }

    /** Response de un destino */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DestinoResponse {
        private String id;

        @JsonProperty("viaje_id")
        private String viajeId;

        private String city;
        private String country;
        private Integer nights;

        @JsonProperty("photo_url")
        private String photoUrl;

        private Integer orden;

        @JsonProperty("google_place_id")
        private String googlePlaceId;
    }
}
