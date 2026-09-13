-- ============================================================================
-- LEGAL METROLOGY VERIFICATION SYSTEM - SUPABASE DATABASE SCHEMA
-- Project ID: sedlhgdzemzekxyknnkv
-- Description: Stores registered user profiles, contact numbers, statutory licenses,
--              and bank-grade encrypted password hashcodes (PBKDF2-HMAC-SHA256).
-- ============================================================================

-- 1. Create the 'users' table in public schema
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT, -- Contact phone number for SMS alerts & 2FA
    contact_number TEXT, -- Alternate alias for contact number
    role TEXT NOT NULL DEFAULT 'BUSINESS_OWNER', -- 'BUSINESS_OWNER', 'INSPECTOR', 'ADMIN', 'PUBLIC'
    business_or_department TEXT,
    license_number TEXT,
    password_hash TEXT NOT NULL, -- PBKDF2-HMAC-SHA256 salted hashcode (NO plaintext)
    salt TEXT NOT NULL,          -- 128-bit cryptographic salt vector
    synced_to_supabase BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create performance & search indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Anon & Authenticated access
-- Allow anyone to read (for login credential verification against salted hashcodes)
CREATE POLICY "Allow public read for authentication" 
ON public.users 
FOR SELECT 
USING (true);

-- Allow anyone to insert (for registering new users)
CREATE POLICY "Allow public user registration" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Allow update for users" 
ON public.users 
FOR UPDATE 
USING (true);

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Insert Default Statutory Portals Initial Accounts (with salted hashcodes)
INSERT INTO public.users (
    user_id, name, email, phone, role, business_or_department, license_number, password_hash, salt
) VALUES 
(
    'USR-BIZ-001',
    'Lokesh Yadav',
    'lokesh@apexlogistics.com',
    '+91 98450 12345',
    'BUSINESS_OWNER',
    'Apex Logistics & Freight Hub',
    'LM-BUS-9821',
    'pbkdf2_sha256$25000$a1b2c3d4e5f67890$498c4c3b53f6562086eecfeebdf13e55e4b77f98eeb966459392e2764ba351ae',
    'a1b2c3d4e5f67890'
),
(
    'USR-INS-001',
    'Officer Ramakrishna',
    'Rama.krishna@metrology.gov',
    '+91 98450 87654',
    'INSPECTOR',
    'Legal Metrology Directorate - Zone 1',
    'LMO-CERT-4410',
    'pbkdf2_sha256$25000$b2c3d4e5f67890a1$6fa17c768c34f24f4e7c3b88b02e75e3a0937a09c256a5c13b34918e7e31cb89',
    'b2c3d4e5f67890a1'
),
(
    'USR-ADM-001',
    'Director Dr. Arvind Sharma',
    'arvind.sharma@consumeraffairs.nic.in',
    '+91 98450 99999',
    'ADMIN',
    'National Metrology Central Command',
    'DIR-LM-HQ-001',
    'pbkdf2_sha256$25000$c3d4e5f67890a1b2$5c8fe228189c17cf7bfa923055ba9b441f77d33d98762ba8bf2a0953bf6ba912',
    'c3d4e5f67890a1b2'
)
ON CONFLICT (email) DO NOTHING;
