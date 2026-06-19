-- Initialize SoloCorp POS Database
-- This runs on first PostgreSQL container start

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema (if needed)
-- CREATE SCHEMA IF NOT EXISTS pos;

-- Note: Tables are managed by Prisma migrations
-- This file is for any raw SQL setup needed before Prisma
