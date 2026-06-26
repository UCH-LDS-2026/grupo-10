-- ==========================================
-- ITERA MVP - Flyway Migration V15
-- Tabla de alquiler de autos por viaje
-- ==========================================

CREATE TABLE IF NOT EXISTS viaje_autos (
    id VARCHAR(36) PRIMARY KEY,
    viaje_id VARCHAR(36) NOT NULL,
    company VARCHAR(150) NOT NULL DEFAULT '',
    booking VARCHAR(100) NOT NULL DEFAULT '',
    location VARCHAR(255) NOT NULL DEFAULT '',
    orden INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_auto_viaje FOREIGN KEY (viaje_id)
        REFERENCES viajes(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auto_viaje ON viaje_autos(viaje_id);
