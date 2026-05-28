

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


-- File: backend-java/src/main/resources/db/migration\V2__increase_atraccion_id_length.sql
ALTER TABLE atracciones MODIFY id VARCHAR(100); ALTER TABLE itinerario_items MODIFY atraccion_id VARCHAR(100);

-- File: backend-java/src/main/resources/db/migration\V3__viaje_destinos_vuelos.sql
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


-- File: backend-java/src/main/resources/db/migration\V4__allow_null_itinerary_times.sql
ALTER TABLE itinerario_items MODIFY COLUMN fecha_asignada DATE NULL;
ALTER TABLE itinerario_items MODIFY COLUMN hora_inicio TIME NULL;
ALTER TABLE itinerario_items MODIFY COLUMN hora_fin TIME NULL;


-- File: backend-java/src/main/resources/db/migration\V5__add_foto_url_to_viajes.sql
-- Migration V5: Add foto_url to viajes table
ALTER TABLE viajes ADD COLUMN foto_url TEXT;


-- File: backend-java/src/main/resources/db/migration\V6__add_foto_perfil_to_usuarios.sql
-- V6: Agrega columna foto_perfil a la tabla usuarios
-- Almacena la URL del endpoint del avatar para ser servida por el backend

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(500) NULL;


-- File: backend-java/src/main/resources/db/migration\V7__add_seguidores.sql
-- V7: Crear tabla de seguidores
CREATE TABLE IF NOT EXISTS seguidores (
    seguidor_id VARCHAR(36) NOT NULL,
    seguido_id VARCHAR(36) NOT NULL,
    fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT fk_seguidor FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_seguido FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- File: backend-java/src/main/resources/db/migration\V8__add_creador_id_to_atracciones.sql
-- Flyway Migration V8
-- Add creador_id to atracciones table

ALTER TABLE atracciones ADD COLUMN creador_id VARCHAR(36) NULL;
ALTER TABLE atracciones ADD CONSTRAINT fk_atracciones_creador FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE SET NULL;


-- File: backend-java/src/main/resources/db/migration\V9__add_accesibilidad_to_atracciones.sql
-- V9: Agregar columna de accesibilidad a la tabla atracciones
ALTER TABLE atracciones ADD COLUMN accesibilidad VARCHAR(150);


-- File: backend-java/src/main/resources/db/migration\V10__increase_categoria_length.sql
ALTER TABLE atracciones MODIFY categoria VARCHAR(255);


-- File: backend-java/src/main/resources/db/migration\V11__add_resenias_table.sql
CREATE TABLE IF NOT EXISTS resenias (
    id VARCHAR(36) PRIMARY KEY,
    atraccion_id VARCHAR(150) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL,
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- File: backend-java/src/main/resources/db/migration\V12__add_fecha_nacimiento_to_usuarios.sql
-- V12: Agrega columna fecha_nacimiento a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE NULL;


