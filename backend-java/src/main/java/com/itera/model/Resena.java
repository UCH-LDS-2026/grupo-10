package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "resenias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resena {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "atraccion_id", nullable = false, length = 150)
    private String atraccionId;

    @Column(name = "usuario_id", nullable = false, length = 36)
    private String usuarioId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "fecha")
    @Builder.Default
    private LocalDateTime fecha = LocalDateTime.now();
}
