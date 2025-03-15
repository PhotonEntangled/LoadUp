-- Create test user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'test'
   ) THEN
      CREATE USER test WITH PASSWORD 'test' CREATEDB;
   END IF;
END
$do$;

-- Grant necessary permissions
ALTER USER test CREATEDB;

-- Create test database if it doesn't exist
CREATE DATABASE loadup_test WITH OWNER = test; 