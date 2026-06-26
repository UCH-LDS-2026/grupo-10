package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "viajes_usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViajeUsuario {

    @EmbeddedId
    private ViajeUsuarioId id;

    @Column(name = "rol", nullable = false, length = 50)
    @Builder.Default
    private String rol = "LECTOR";

    @Column(name = "estado", nullable = false, length = 50)
    @Builder.Default
    private String estado = "PENDIENTE";

    @Column(name = "fecha_invitacion", insertable = false, updatable = false)
    private LocalDateTime fechaInvitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("viajeId")
    @JoinColumn(name = "viaje_id", insertable = false, updatable = false)
    private Viaje viaje;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;
}
