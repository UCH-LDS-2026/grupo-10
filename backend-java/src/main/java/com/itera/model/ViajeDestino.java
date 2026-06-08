package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA para la tabla 'viaje_destinos'.
 * Cada destino queda vinculado a un viaje específico, garantizando independencia.
 */
@Entity
@Table(name = "viaje_destinos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViajeDestino {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "viaje_id", nullable = false, length = 36)
    private String viajeId;

    @Column(name = "city", nullable = false, length = 150)
    private String city;

    @Column(name = "country", nullable = false, length = 150)
    @Builder.Default
    private String country = "";

    @Column(name = "nights", nullable = false)
    @Builder.Default
    private Integer nights = 1;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "orden", nullable = false)
    @Builder.Default
    private Integer orden = 0;

    @Column(name = "google_place_id", length = 255)
    private String googlePlaceId;
}
