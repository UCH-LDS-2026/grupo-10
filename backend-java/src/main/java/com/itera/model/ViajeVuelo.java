package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA para la tabla 'viaje_vuelos'.
 * Cada vuelo queda vinculado a un viaje específico, garantizando independencia.
 */
@Entity
@Table(name = "viaje_vuelos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViajeVuelo {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "viaje_id", nullable = false, length = 36)
    private String viajeId;

    @Column(name = "direction", nullable = false, length = 10)
    @Builder.Default
    private String direction = "ida";

    @Column(name = "airline", nullable = false, length = 150)
    @Builder.Default
    private String airline = "";

    @Column(name = "flight", nullable = false, length = 50)
    @Builder.Default
    private String flight = "";

    @Column(name = "origin", nullable = false, length = 150)
    @Builder.Default
    private String origin = "";

    @Column(name = "dest", nullable = false, length = 150)
    @Builder.Default
    private String dest = "";

    @Column(name = "dep", length = 30)
    private String dep;

    @Column(name = "arr", length = 30)
    private String arr;

    @Column(name = "flight_type", nullable = false, length = 20)
    @Builder.Default
    private String flightType = "final";

    @Column(name = "orden", nullable = false)
    @Builder.Default
    private Integer orden = 0;
}
