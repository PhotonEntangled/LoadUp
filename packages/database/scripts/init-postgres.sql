-- Create postgres user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'postgres'
   ) THEN
      CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;
   END IF;
END
$do$;

-- Create test user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'test'
   ) THEN
      CREATE USER test WITH PASSWORD 'test' CREATEDB;
   END IF;
END
$do$;

-- Grant necessary permissions
ALTER USER postgres SUPERUSER;
ALTER USER test CREATEDB;

-- Create test database if it doesn't exist
DROP DATABASE IF EXISTS loadup_test;
CREATE DATABASE loadup_test WITH OWNER = test;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE loadup_test TO test; 