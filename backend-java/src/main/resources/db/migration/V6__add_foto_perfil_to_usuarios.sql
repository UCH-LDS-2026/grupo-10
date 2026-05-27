-- V6: Agrega columna foto_perfil a la tabla usuarios
-- Almacena la URL del endpoint del avatar para ser servida por el backend

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(500) NULL;
