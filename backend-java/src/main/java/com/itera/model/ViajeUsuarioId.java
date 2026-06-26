package com.itera.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViajeUsuarioId implements Serializable {

    @Column(name = "viaje_id", length = 36)
    private String viajeId;

    @Column(name = "usuario_id", length = 36)
    private String usuarioId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ViajeUsuarioId that = (ViajeUsuarioId) o;
        return Objects.equals(viajeId, that.viajeId) &&
               Objects.equals(usuarioId, that.usuarioId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(viajeId, usuarioId);
    }
}
