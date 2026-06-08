ALTER TABLE itinerario_items DROP FOREIGN KEY fk_atraccion;
ALTER TABLE atracciones MODIFY id VARCHAR(100);
ALTER TABLE itinerario_items MODIFY atraccion_id VARCHAR(100);
ALTER TABLE itinerario_items ADD CONSTRAINT fk_atraccion FOREIGN KEY (atraccion_id) REFERENCES atracciones(id) ON DELETE RESTRICT;