-- Create the facilities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Water Refill', 'Waste Bin'
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    addr TEXT,
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Maintenance', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Allow anyone (or authenticated users) to read Active facilities
DROP POLICY IF EXISTS "Allow public read access to active facilities" ON public.facilities;
CREATE POLICY "Allow public read access to active facilities" 
ON public.facilities FOR SELECT 
USING (status = 'Active');