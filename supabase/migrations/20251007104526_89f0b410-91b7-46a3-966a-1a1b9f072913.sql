-- Fix announcements created_by nullable field
-- First, set a default for any existing NULL values (use a system admin if exists, otherwise skip)
UPDATE announcements 
SET created_by = (
  SELECT user_id 
  FROM user_roles 
  WHERE role = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Make the column NOT NULL
ALTER TABLE announcements 
ALTER COLUMN created_by SET NOT NULL;

-- Add a default to always set created_by to the current user
ALTER TABLE announcements 
ALTER COLUMN created_by SET DEFAULT auth.uid();