-- Ensure no batch has current_count greater than max_capacity, then add a constraint
BEGIN;

-- Normalize any existing rows where current_count > max_capacity
UPDATE batches
SET current_count = max_capacity
WHERE max_capacity IS NOT NULL AND current_count > max_capacity;

-- If max_capacity can be null in your schema, treat null as unlimited; the check below only applies when max_capacity IS NOT NULL
ALTER TABLE batches
ADD CONSTRAINT batches_current_count_lte_max_capacity CHECK (max_capacity IS NULL OR current_count <= max_capacity);

COMMIT;
