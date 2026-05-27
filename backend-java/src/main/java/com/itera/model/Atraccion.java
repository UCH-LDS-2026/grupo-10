package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Entidad JPA equivalente a la tabla 'atracciones'.
 */
@Entity
@Table(name = "atracciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Atraccion {

    @Id
    @Column(name = "id", length = 100)
    private String id;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "latitud", precision = 10, scale = 8)
    private BigDecimal latitud;

    @Column(name = "longitud", precision = 11, scale = 8)
    private BigDecimal longitud;

    @Column(name = "costo", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal costo = BigDecimal.ZERO;

    @Column(name = "necesita_turno")
    @Builder.Default
    private Boolean necesitaTurno = false;

    @Column(name = "es_oficial")
    @Builder.Default
    private Boolean esOficial = false;

    @Column(name = "foto_url", columnDefinition = "TEXT")
    private String fotoUrl;

    @Column(name = "direccion", length = 255)
    private String direccion;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "categoria", length = 255)
    private String categoria;

    @Column(name = "google_place_id", length = 150)
    private String googlePlaceId;

    @Column(name = "creador_id", length = 36)
    private String creadorId;

    @Column(name = "accesibilidad", length = 150)
    private String accesibilidad;
}
