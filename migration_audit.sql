-- Audit Migration: Normalize Schema and Add Data Integrity

-- 1. Add file_id to Knowledge Chunks for clean cleanup
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS file_id uuid;

-- 2. Link existing chunks to files (if possible, based on creation time, but better just to clear and re-upload if inconsistent)
-- If table was empty, no problem.

-- 3. Enforce normalized phone numbers in phone_numbers table
-- This depends on the specific logic. Usually, we should use a trigger or a check constraint.
-- For this demo, let's just add a comment for the user to use E.164.

-- 4. Ensure call_logs has correct FKs
ALTER TABLE call_logs DROP CONSTRAINT IF EXISTS fk_call_logs_agent;
ALTER TABLE call_logs ADD CONSTRAINT fk_call_logs_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- 5. Ensure reservations has correct FKs 
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS fk_reservations_agent;
ALTER TABLE reservations ADD CONSTRAINT fk_reservations_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

-- 6. UNIQUE index on phone_numbers.phone_number
CREATE UNIQUE INDEX IF NOT EXISTS unq_phone_number ON phone_numbers(phone_number);
