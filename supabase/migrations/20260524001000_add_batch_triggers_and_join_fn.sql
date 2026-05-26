-- Add trigger to clamp current_count to max_capacity and an atomic join_batch function
BEGIN;

-- Trigger function to clamp current_count on INSERT/UPDATE
CREATE OR REPLACE FUNCTION batches_clamp_current_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.max_capacity IS NOT NULL THEN
    IF NEW.current_count IS NULL THEN
      NEW.current_count := 0;
    END IF;
    NEW.current_count := LEAST(NEW.current_count, NEW.max_capacity);
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_batches_clamp_current_count ON batches;
CREATE TRIGGER trg_batches_clamp_current_count
BEFORE INSERT OR UPDATE ON batches
FOR EACH ROW EXECUTE FUNCTION batches_clamp_current_count();

-- Atomic join_batch function: inserts into batch_bookings and increments batches.current_count safely
CREATE OR REPLACE FUNCTION join_batch(p_batch_id uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_max integer;
  v_current integer;
BEGIN
  -- lock the batch row to avoid races
  SELECT max_capacity, current_count INTO v_max, v_current FROM batches WHERE id = p_batch_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Batch not found';
  END IF;

  -- treat NULL max_capacity as unlimited
  IF v_max IS NOT NULL AND v_current >= v_max THEN
    RAISE EXCEPTION 'Batch full';
  END IF;

  -- try to insert booking; rely on unique constraint to prevent duplicates
  BEGIN
    INSERT INTO batch_bookings(batch_id, user_id, created_at)
    VALUES (p_batch_id, p_user_id, now());
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Already joined';
  END;

  -- increment the current_count (clamp trigger will not reduce it below max because we checked)
  UPDATE batches SET current_count = current_count + 1 WHERE id = p_batch_id;

  RETURN;
END;
$$;

COMMIT;
