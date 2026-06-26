package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA para la tabla 'viaje_autos'.
 * Guarda los detalles de reservas de alquiler de autos por viaje.
 */
@Entity
@Table(name = "viaje_autos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViajeAuto {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "viaje_id", nullable = false, length = 36)
    private String viajeId;

    @Column(name = "company", nullable = false, length = 150)
    @Builder.Default
    private String company = "";

    @Column(name = "booking", nullable = false, length = 100)
    @Builder.Default
    private String booking = "";

    @Column(name = "location", nullable = false, length = 255)
    @Builder.Default
    private String location = "";

    @Column(name = "orden", nullable = false)
    @Builder.Default
    private Integer orden = 0;
}
