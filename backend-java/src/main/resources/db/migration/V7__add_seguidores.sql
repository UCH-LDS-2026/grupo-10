-- V7: Crear tabla de seguidores
CREATE TABLE IF NOT EXISTS seguidores (
    seguidor_id VARCHAR(36) NOT NULL,
    seguido_id VARCHAR(36) NOT NULL,
    fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT fk_seguidor FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_seguido FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
