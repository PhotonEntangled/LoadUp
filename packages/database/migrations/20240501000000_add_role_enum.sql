-- Create role enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'driver', 'customer');
    END IF;
END $$;

-- Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role user_role NOT NULL DEFAULT 'customer';
    END IF;
END $$;

-- Create index on role column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_users_role'
    ) THEN
        CREATE INDEX idx_users_role ON public.users (role);
    END IF;
END $$; 