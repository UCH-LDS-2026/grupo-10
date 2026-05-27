-- ==========================================
-- ITERA MVP - Flyway Migration V2
-- Tablas de destinos y vuelos por viaje
-- ==========================================

CREATE TABLE IF NOT EXISTS viaje_destinos (
    id VARCHAR(36) PRIMARY KEY,
    viaje_id VARCHAR(36) NOT NULL,
    city VARCHAR(150) NOT NULL,
    country VARCHAR(150) NOT NULL DEFAULT '',
    nights INT NOT NULL DEFAULT 1,
    photo_url TEXT,
    orden INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_destino_viaje FOREIGN KEY (viaje_id)
        REFERENCES viajes(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS viaje_vuelos (
    id VARCHAR(36) PRIMARY KEY,
    viaje_id VARCHAR(36) NOT NULL,
    direction VARCHAR(10) NOT NULL DEFAULT 'ida',  -- 'ida' o 'vuelta'
    airline VARCHAR(150) NOT NULL DEFAULT '',
    flight VARCHAR(50) NOT NULL DEFAULT '',
    origin VARCHAR(150) NOT NULL DEFAULT '',
    dest VARCHAR(150) NOT NULL DEFAULT '',
    dep VARCHAR(30),
    arr VARCHAR(30),
    flight_type VARCHAR(20) NOT NULL DEFAULT 'final',  -- 'final' o 'escala'
    orden INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_vuelo_viaje FOREIGN KEY (viaje_id)
        REFERENCES viajes(id)
        ON DELETE CASCADE
);

-- Índices (ignorar si ya existen)
-- MySQL/MariaDB: se usan CREATE INDEX directos; si falla porque ya existe, no bloquea Flyway
-- porque las tablas ya tienen los índices por las FKs
