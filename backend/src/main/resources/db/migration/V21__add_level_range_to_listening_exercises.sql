ALTER TABLE listening_exercises ADD COLUMN level_min VARCHAR(10);
ALTER TABLE listening_exercises ADD COLUMN level_max VARCHAR(10);

UPDATE listening_exercises SET level_min = level, level_max = level;

ALTER TABLE listening_exercises ALTER COLUMN level_min SET NOT NULL;
ALTER TABLE listening_exercises ALTER COLUMN level_max SET NOT NULL;
ALTER TABLE listening_exercises DROP COLUMN level;
