USE doctor_wilson;

-- Ejecuta este script sobre una base ya creada.
-- Corrige el nombre histórico `ombre` si todavía existe y agrega antecedentes
-- a historias_clinicas solo cuando haga falta.

SET @sql = (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'propietarios'
        AND COLUMN_NAME = 'ombre'
    ),
    'ALTER TABLE propietarios CHANGE COLUMN ombre nombre VARCHAR(50) NOT NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    NOT EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'historias_clinicas'
        AND COLUMN_NAME = 'antecedentes'
    ),
    'ALTER TABLE historias_clinicas ADD COLUMN antecedentes TEXT NULL AFTER motivo_consulta',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
