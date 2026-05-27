-- V12: Agrega columna fecha_nacimiento a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE NULL;
