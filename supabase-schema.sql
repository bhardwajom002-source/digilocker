-- DigiLocker Supabase Database Schema
-- Run this SQL in your Supabase Dashboard > SQL Editor to create the required tables

-- Create users table for storing user accounts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- Using email as ID (normalized)
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (app handles auth)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE users IS 'DigiLocker user accounts - stores email, name, and password hashes';
COMMENT ON COLUMN users.id IS 'User identifier (normalized email)';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.name IS 'User display name';
COMMENT ON COLUMN users.password_hash IS 'SHA-256 hash of password with salt';
COMMENT ON COLUMN users.salt IS 'Random salt for password hashing';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.last_login IS 'Last login timestamp';
