-- V14: Crear tabla de viajes compartidos con otros usuarios (viajes_usuarios)

CREATE TABLE IF NOT EXISTS viajes_usuarios (
    viaje_id VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'LECTOR', -- 'LECTOR' o 'EDITOR'
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'ACEPTADO', 'RECHAZADO'
    fecha_invitacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (viaje_id, usuario_id),
    CONSTRAINT fk_viaje_usuario_v FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE,
    CONSTRAINT fk_viaje_usuario_u FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
