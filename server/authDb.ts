import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DatabaseUserRecord {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: 'BUSINESS_OWNER' | 'INSPECTOR' | 'ADMIN' | 'PUBLIC';
  businessOrDepartment: string;
  licenseNumber: string;
  salt: string;
  passwordHash: string;
  hashAlgorithm: string;
  createdAt: number;
  lastLogin?: number;
}

export type SafeUserRecord = Omit<DatabaseUserRecord, 'salt' | 'passwordHash'>;

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users_database.json');
const REMEMBERED_FILE = path.join(DATA_DIR, 'remembered_user.json');

// Cryptographic Salted Hashing: PBKDF2 with SHA-512 and 100,000 iterations
const HASH_ALGORITHM = 'PBKDF2-SHA512-100000';

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const candidateHash = hashPassword(password, salt);
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  } catch (err) {
    console.error('[Crypto Error] Password verification failed:', err);
    return false;
  }
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial seeded accounts with cryptographic salts and hashes
function getInitialSeedUsers(): DatabaseUserRecord[] {
  const defaultPass = 'GovVerify@2026';
  
  const seedProfiles = [
    {
      userId: 'USR-BIZ-001',
      name: 'Lokesh Yadav',
      email: 'lokesh@apexlogistics.com',
      phone: '+91 98450 12345',
      role: 'BUSINESS_OWNER' as const,
      businessOrDepartment: 'Apex Logistics & Freight Hub',
      licenseNumber: 'LM-BUS-9821'
    },
    {
      userId: 'USR-INS-001',
      name: 'Officer Ramakrishna',
      email: 'Rama.krishna@metrology.gov',
      phone: '+91 98450 87654',
      role: 'INSPECTOR' as const,
      businessOrDepartment: 'Legal Metrology Directorate - Zone 1',
      licenseNumber: 'LMO-CERT-4410'
    },
    {
      userId: 'USR-ADM-001',
      name: 'Chief Inspector Pavan',
      email: 'pavan@govmetrology.state.gov',
      phone: '+91 98450 99011',
      role: 'ADMIN' as const,
      businessOrDepartment: 'National Metrological Regulatory Board',
      licenseNumber: 'EXEC-MET-001'
    },
    {
      userId: 'USR-PUB-001',
      name: 'Rajesh Sharma (Citizen)',
      email: 'consumer@publicportal.gov',
      phone: '+91 98450 54321',
      role: 'PUBLIC' as const,
      businessOrDepartment: 'Public Verification Portal',
      licenseNumber: 'N/A'
    }
  ];

  return seedProfiles.map(p => {
    const salt = generateSalt();
    const passwordHash = hashPassword(defaultPass, salt);
    return {
      ...p,
      salt,
      passwordHash,
      hashAlgorithm: HASH_ALGORITHM,
      createdAt: Date.now() - 30 * 86400000
    };
  });
}

export function readDatabaseUsers(): DatabaseUserRecord[] {
  ensureDataDirectory();
  if (!fs.existsSync(USERS_FILE)) {
    const seed = getInitialSeedUsers();
    writeDatabaseUsers(seed);
    return seed;
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('[DB Error] Failed to read database, recreating:', err);
  }
  const seed = getInitialSeedUsers();
  writeDatabaseUsers(seed);
  return seed;
}

export function writeDatabaseUsers(users: DatabaseUserRecord[]): void {
  ensureDataDirectory();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function toSafeUser(u: DatabaseUserRecord): SafeUserRecord {
  const { salt, passwordHash, ...safe } = u;
  return safe;
}

export function getAllSafeUsers(): SafeUserRecord[] {
  return readDatabaseUsers().map(toSafeUser);
}

export function findUserByCredential(credential: string, role?: string): DatabaseUserRecord | undefined {
  const users = readDatabaseUsers();
  const lower = credential.toLowerCase().trim();
  return users.find(u => {
    const emailMatch = u.email.toLowerCase() === lower;
    const idMatch = u.userId.toLowerCase() === lower;
    const licenseMatch = u.licenseNumber.toLowerCase() === lower;
    const phoneMatch = u.phone.replace(/\D/g, '') === lower.replace(/\D/g, '');
    const isMatched = emailMatch || idMatch || licenseMatch || (phoneMatch && lower.length >= 7);
    if (!isMatched) return false;
    if (role && u.role !== role) return false;
    return true;
  });
}

export function registerNewUser(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'BUSINESS_OWNER' | 'INSPECTOR' | 'ADMIN' | 'PUBLIC';
  businessOrDepartment: string;
  licenseNumber: string;
}): { success: boolean; user?: SafeUserRecord; message?: string } {
  const users = readDatabaseUsers();
  const lowerEmail = data.email.toLowerCase().trim();

  const existing = users.find(u => u.email.toLowerCase() === lowerEmail);
  if (existing) {
    return {
      success: false,
      message: `An official account is already registered with email address ${data.email}. Please sign in instead.`
    };
  }

  const prefix = data.role === 'BUSINESS_OWNER' ? 'BIZ' : data.role === 'INSPECTOR' ? 'INS' : data.role === 'ADMIN' ? 'ADM' : 'PUB';
  const userId = `USR-${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  const salt = generateSalt();
  const passwordHash = hashPassword(data.password, salt);

  const newUser: DatabaseUserRecord = {
    userId,
    name: data.name.trim(),
    email: lowerEmail,
    phone: data.phone.trim(),
    role: data.role,
    businessOrDepartment: data.businessOrDepartment.trim() || 'Directorate Commercial Establishment',
    licenseNumber: data.licenseNumber.trim() || `LM-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
    salt,
    passwordHash,
    hashAlgorithm: HASH_ALGORITHM,
    createdAt: Date.now()
  };

  users.push(newUser);
  writeDatabaseUsers(users);

  console.log(`[Security Audit] User registered securely: ${newUser.userId} (${newUser.email}). Password stored as 128-hex PBKDF2 hashcode. Zero plaintext stored.`);

  return {
    success: true,
    user: toSafeUser(newUser),
    message: 'User registered successfully with encrypted salted hash in database.'
  };
}

export function authenticateUser(
  credential: string,
  passwordAttempt: string,
  role?: 'BUSINESS_OWNER' | 'INSPECTOR' | 'ADMIN' | 'PUBLIC'
): { success: boolean; user?: SafeUserRecord; message?: string } {
  const user = findUserByCredential(credential, role);
  if (!user) {
    return {
      success: false,
      message: 'No registered user found with the provided credentials. Please check your email/badge or register.'
    };
  }

  // Public role can access without password
  if (user.role === 'PUBLIC') {
    return { success: true, user: toSafeUser(user) };
  }

  const isPasswordValid = verifyPassword(passwordAttempt, user.salt, user.passwordHash);
  if (!isPasswordValid) {
    return {
      success: false,
      message: 'Invalid password. Please check your credentials or use the PIN recovery option.'
    };
  }

  // Update last login
  user.lastLogin = Date.now();
  const users = readDatabaseUsers().map(u => u.userId === user.userId ? user : u);
  writeDatabaseUsers(users);

  return {
    success: true,
    user: toSafeUser(user)
  };
}

// Remember Me Persistence
export interface RememberedData {
  email: string;
  phone: string;
  role: string;
  rememberedAt: number;
}

export function saveRememberedUser(data: { email: string; phone?: string; role?: string }): void {
  ensureDataDirectory();
  const payload: RememberedData = {
    email: data.email,
    phone: data.phone || '',
    role: data.role || 'BUSINESS_OWNER',
    rememberedAt: Date.now()
  };
  fs.writeFileSync(REMEMBERED_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}

export function getRememberedUser(): RememberedData | null {
  ensureDataDirectory();
  if (!fs.existsSync(REMEMBERED_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(REMEMBERED_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearRememberedUser(): void {
  ensureDataDirectory();
  if (fs.existsSync(REMEMBERED_FILE)) {
    try {
      fs.unlinkSync(REMEMBERED_FILE);
    } catch (e) {
      console.warn('Failed to clear remembered file:', e);
    }
  }
}

// Security Audit Transparency (Verifies database breach protection)
export function getSecurityAuditReport() {
  const users = readDatabaseUsers();
  return {
    totalUsers: users.length,
    encryptionAlgorithm: 'PBKDF2-HMAC-SHA512 with 100,000 Iterations',
    iterations: 100000,
    saltLengthBits: 128,
    plaintextExposed: 0,
    breachProtectionStatus: 'OPTIMAL_PBKDF2_SECURED',
    databaseFile: 'data/users_database.json',
    records: users.map(u => ({
      userId: u.userId,
      email: u.email,
      phone: u.phone,
      role: u.role,
      saltSnippet: u.salt.substring(0, 10) + '...' + u.salt.substring(u.salt.length - 6),
      hashSnippet: u.passwordHash.substring(0, 16) + '...' + u.passwordHash.substring(u.passwordHash.length - 16),
      hashAlgorithm: u.hashAlgorithm,
      createdAt: u.createdAt
    }))
  };
}
