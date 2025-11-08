-- TrainSmart Database Schema for Supabase
-- This schema should be executed in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile Table
CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

    -- Personal Information
    name TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',

    -- Anthropometric Data
    weight DECIMAL(5,1),
    height INTEGER,
    body_fat DECIMAL(4,1),
    bmi DECIMAL(4,1),

    -- Physiological Metrics
    vo2max DECIMAL(4,1),
    vma DECIMAL(4,1),
    fc_max INTEGER,
    fc_repos INTEGER,

    -- Reminder Settings
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_time TEXT,
    reminder_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Basic Information
    type TEXT NOT NULL CHECK (type IN ('musculation', 'running')),
    date DATE NOT NULL,
    duration INTEGER,
    notes TEXT,
    status TEXT CHECK (status IN ('planned', 'completed')) DEFAULT 'completed',

    -- Musculation Specific
    exercises JSONB,
    total_volume DECIMAL(10,2),

    -- Running Specific
    distance DECIMAL(6,2),
    pace TEXT,
    elevation INTEGER,
    distance_equivalent DECIMAL(6,2),
    heart_rate INTEGER,

    -- Common Metrics
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
    forme INTEGER CHECK (forme BETWEEN 1 AND 10),
    trimp INTEGER,

    -- Timestamps
    planned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Goal Information
    type TEXT NOT NULL CHECK (type IN ('general', 'musculation', 'running')),
    description TEXT NOT NULL,
    target DECIMAL(10,2),
    unit TEXT,
    deadline DATE,
    status TEXT CHECK (status IN ('active', 'completed')) DEFAULT 'active',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can view own profile"
    ON users_profile FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON users_profile FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON users_profile FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for workouts
CREATE POLICY "Users can view own workouts"
    ON workouts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
    ON workouts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
    ON workouts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
    ON workouts FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals"
    ON goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON goals FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date DESC);
CREATE INDEX idx_workouts_user_type ON workouts(user_id, type);
CREATE INDEX idx_goals_user_deadline ON goals(user_id, deadline);
CREATE INDEX idx_users_profile_user_id ON users_profile(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
