package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entidad JPA equivalente a la tabla 'itinerario_items'.
 */
@Entity
@Table(name = "itinerario_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemItinerario {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "viaje_id", nullable = false, length = 36)
    private String viajeId;

    @Column(name = "atraccion_id", nullable = false, length = 100)
    private String atraccionId;

    @Column(name = "fecha_asignada")
    private LocalDate fechaAsignada;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    // Campos para transporte al siguiente punto
    @Column(name = "transporte_prox_tipo", length = 50)
    private String transporteProxTipo;

    @Column(name = "transporte_prox_duracion")
    private Float transporteProxDuracion;
}
