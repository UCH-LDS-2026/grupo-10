package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Entidad JPA equivalente a la tabla 'viajes'.
 */
@Entity
@Table(name = "viajes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Viaje {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "creador_id", nullable = false, length = 36)
    private String creadorId;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "destino_principal", nullable = false, length = 100)
    private String destinoPrincipal;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "estado", length = 50)
    @Builder.Default
    private String estado = "En Planificación";

    @Column(name = "foto_url", columnDefinition = "TEXT")
    private String fotoUrl;

    @Column(name = "es_privado", nullable = false)
    @Builder.Default
    private Boolean esPrivado = false;
}
