-- Add wallet_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC NOT NULL DEFAULT 0;

-- Expand batch_bookings to support checkout data
ALTER TABLE public.batch_bookings ADD COLUMN IF NOT EXISTS travelers_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.batch_bookings ADD COLUMN IF NOT EXISTS addons TEXT[] DEFAULT '{}';
ALTER TABLE public.batch_bookings ADD COLUMN IF NOT EXISTS wallet_used NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.batch_bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC NOT NULL DEFAULT 0;

-- Add a new RPC for joining a batch with full checkout data (reserving the spot)
CREATE OR REPLACE FUNCTION public.checkout_batch(
  p_batch_id uuid,
  p_user_id uuid,
  p_travelers_count integer,
  p_addons text[],
  p_wallet_used numeric,
  p_total_amount numeric
)
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
  IF v_max IS NOT NULL AND (v_current + p_travelers_count) > v_max THEN
    RAISE EXCEPTION 'Batch full';
  END IF;

  -- try to insert booking; rely on unique constraint if needed, but wait, a user can book for multiple people?
  -- if they already have a booking, we might update it or throw
  BEGIN
    INSERT INTO batch_bookings(batch_id, user_id, status, travelers_count, addons, wallet_used, total_amount, created_at)
    VALUES (p_batch_id, p_user_id, 'pending', p_travelers_count, p_addons, p_wallet_used, p_total_amount, now());
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Already joined';
  END;

  -- increment the current_count
  UPDATE batches SET current_count = current_count + p_travelers_count WHERE id = p_batch_id;

  -- Deduct wallet balance if used
  IF p_wallet_used > 0 THEN
    UPDATE profiles SET wallet_balance = wallet_balance - p_wallet_used WHERE user_id = p_user_id;
  END IF;

  RETURN;
END;
$$;
