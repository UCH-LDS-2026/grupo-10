CREATE TABLE IF NOT EXISTS resenias (
    id VARCHAR(36) PRIMARY KEY,
    atraccion_id VARCHAR(150) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL,
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
