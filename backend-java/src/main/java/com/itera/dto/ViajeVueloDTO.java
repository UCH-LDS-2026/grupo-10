package com.itera.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs para vuelos por viaje.
 * @JsonProperty garantiza snake_case en JSON.
 */
public class ViajeVueloDTO {

    /** Request para crear/actualizar un vuelo */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VueloCreate {
        private String direction = "ida";
        private String airline = "";
        private String flight = "";
        private String origin = "";
        private String dest = "";
        private String dep;
        private String arr;

        @JsonProperty("flight_type")
        private String flightType = "final";

        private Integer orden = 0;
    }

    /** Response de un vuelo */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VueloResponse {
        private String id;

        @JsonProperty("viaje_id")
        private String viajeId;

        private String direction;
        private String airline;
        private String flight;
        private String origin;
        private String dest;
        private String dep;
        private String arr;

        @JsonProperty("flight_type")
        private String flightType;

        private Integer orden;
    }
}
