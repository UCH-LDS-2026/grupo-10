-- ==========================================
-- ITERA MVP - Base de Datos (MySQL / MariaDB)
-- Flyway Migration V1
-- ==========================================

-- Nota: Flyway gestiona si ya existe la DB. Las tablas solo se crean si no existen.

-- ==========================================
-- 1. CREACIÓN DE TABLAS (DDL)
-- ==========================================

CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    nacionalidad VARCHAR(100),
    edad INT,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS viajes (
    id VARCHAR(36) PRIMARY KEY,
    creador_id VARCHAR(36) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    destino_principal VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'En Planificación',

    CONSTRAINT fk_creador FOREIGN KEY (creador_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS atracciones (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    costo DECIMAL(10, 2) DEFAULT 0.00,
    necesita_turno BOOLEAN DEFAULT FALSE,
    es_oficial BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS itinerario_items (
    id VARCHAR(36) PRIMARY KEY,
    viaje_id VARCHAR(36) NOT NULL,
    atraccion_id VARCHAR(36) NOT NULL,
    fecha_asignada DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    transporte_prox_tipo VARCHAR(50),
    transporte_prox_duracion FLOAT,

    CONSTRAINT fk_viaje FOREIGN KEY (viaje_id)
        REFERENCES viajes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_atraccion FOREIGN KEY (atraccion_id)
        REFERENCES atracciones(id)
        ON DELETE RESTRICT
);

-- ==========================================
-- 2. ÍNDICES DE RENDIMIENTO
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_itinerario_viaje ON itinerario_items(viaje_id, fecha_asignada);
CREATE INDEX IF NOT EXISTS idx_atracciones_ubicacion ON atracciones(latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth ON usuarios(email, username);
