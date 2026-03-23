-- Migration: Add missing compliance and capacity columns to agents table

ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 20;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS ai_disclosure BOOLEAN DEFAULT TRUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS disclosure_text TEXT DEFAULT 'This call is handled by an AI assistant.';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS recording_announcement BOOLEAN DEFAULT TRUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS recording_script TEXT DEFAULT 'This call may be recorded for quality and training purposes.';

-- Also add transcription_enabled and wait_time if missing
ALTER TABLE agents ADD COLUMN IF NOT EXISTS transcription_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS wait_time INTEGER DEFAULT 1;

-- Ensure created_at exists for ordering
ALTER TABLE agents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
