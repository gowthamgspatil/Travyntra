-- Prevent batch.current_count from exceeding max_capacity by capping values
-- This trigger will run BEFORE INSERT OR UPDATE on the batches table

CREATE OR REPLACE FUNCTION enforce_batch_capacity()
RETURNS trigger AS $$
BEGIN
  IF NEW.max_capacity IS NULL THEN
    NEW.max_capacity := 0;
  END IF;
  IF NEW.current_count IS NULL THEN
    NEW.current_count := 0;
  END IF;
  -- Cap current_count to max_capacity
  IF NEW.current_count > NEW.max_capacity THEN
    NEW.current_count := NEW.max_capacity;
  END IF;
  -- Ensure non-negative values
  IF NEW.current_count < 0 THEN
    NEW.current_count := 0;
  END IF;
  IF NEW.max_capacity < 0 THEN
    NEW.max_capacity := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_batch_capacity ON batches;
CREATE TRIGGER trigger_enforce_batch_capacity
BEFORE INSERT OR UPDATE ON batches
FOR EACH ROW
EXECUTE FUNCTION enforce_batch_capacity();
