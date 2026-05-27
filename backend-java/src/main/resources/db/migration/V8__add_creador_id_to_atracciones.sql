-- Flyway Migration V8
-- Add creador_id to atracciones table

ALTER TABLE atracciones ADD COLUMN creador_id VARCHAR(36) NULL;
ALTER TABLE atracciones ADD CONSTRAINT fk_atracciones_creador FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE SET NULL;
