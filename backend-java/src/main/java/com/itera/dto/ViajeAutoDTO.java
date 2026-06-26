package com.itera.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs para alquiler de autos por viaje.
 * @JsonProperty garantiza snake_case en JSON.
 */
public class ViajeAutoDTO {

    /** Request para guardar un auto de alquiler */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutoCreate {
        private String company = "";
        private String booking = "";
        private String location = "";
        private Integer orden = 0;
    }

    /** Response de un auto de alquiler */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AutoResponse {
        private String id;

        @JsonProperty("viaje_id")
        private String viajeId;

        private String company;
        private String booking;
        private String location;
        private Integer orden;
    }
}
