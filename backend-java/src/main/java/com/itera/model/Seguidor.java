package com.itera.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "seguidores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seguidor {

    @EmbeddedId
    private SeguidorId id;

    @Column(name = "fecha_seguimiento", insertable = false, updatable = false)
    private LocalDateTime fechaSeguimiento;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeguidorId implements Serializable {
        @Column(name = "seguidor_id", length = 36)
        private String seguidorId;

        @Column(name = "seguido_id", length = 36)
        private String seguidoId;
    }
}
