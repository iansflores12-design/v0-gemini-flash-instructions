-- Add value column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS value TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS tasks_user_id_due_date_idx ON tasks(user_id, due_date);
