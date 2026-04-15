# Argon2 Password Hashing Implementation Guide

## Overview
Argon2 is a memory-hard password hashing algorithm that won the Password Hashing Competition (2015). It's the current best practice for password storage and is resistant to modern attack methods.

## How Argon2 Works

### Algorithm Architecture
Argon2 is a **memory-hard key derivation function** that combines:

1. **Memory Hardness**: Uses significant amounts of RAM during hashing
   - Makes parallel processing difficult
   - Requires attackers to rent/buy expensive hardware
   - Each hash requires ~19 MB of memory by default

2. **Time Cost**: Multiple iterations of the algorithm
   - Default: 2-3 iterations
   - Increases computational time
   - Can be adjusted based on security requirements

3. **Parallelization**: Can use multiple processor threads
   - Default: 1 thread (sequential)
   - Allows legitimate servers to hash faster
   - Different from attacker's parallel attempts

4. **Salt**: Random 16-byte unique value per password
   - Prevents rainbow table attacks
   - Makes identical passwords have different hashes
   - Automatically generated per user

### Argon2 Variants
- **Argon2i**: Optimized against side-channel attacks (original)
- **Argon2d**: Optimized for speed (faster)
- **Argon2id**: Hybrid (recommended) - combines both benefits

### Default Parameters (Argon2id)
```
Memory Cost (m): 19,456 KB (~19 MB)
Time Cost (t): 2 iterations
Parallelism (p): 1 thread
Salt Length: 16 bytes
Output Length: 32 bytes
```

### Hash Output Example
```
$argon2id$v=19$m=19456,t=2,p=1$sG5aBEyWjQe3//H9dLH/Kw$PoFQcfq3RrA+LS0SJEZwQAj3VuQrQ9YzA0/7T3w0eSg
     ^       ^              ^               ^
   Variant  Version      Parameters       Hash+Salt
```

## Why Argon2 is Resistant to GPU Brute-Force Attacks

### The Problem with Traditional Hashing (MD5, SHA-1)
```
GPU Attack Speed:
- MD5: ~8 billion hashes/second (GPU)
- SHA-1: ~4 billion hashes/second (GPU)
- bcrypt: ~12,000 hashes/second (GPU)
- Argon2: ~3 hashes/second (GPU)
```

### GPU Parallelization Advantages Don't Apply

1. **Memory Bandwidth Limitation**
   - GPUs have high bandwidth but limited per-core memory
   - Argon2 requires each hash to use 19 MB of RAM
   - GPU can only run ~100 hashes in parallel (vs billions for MD5)
   - Memory bus becomes bottleneck, not computational power

2. **Cache Invalidation**
   - Argon2 deliberately causes cache misses
   - Prevents timing optimization
   - Negates GPU's cache efficiency advantage

3. **Sequential Operations**
   - Each memory access depends on previous one
   - Can't parallelize the algorithm itself
   - Prevents GPU's massive parallelism advantage

### Cost Analysis: Cracking a Password

**Traditional MD5 (10-character password, lowercase + digits + symbols)**
```
Total combinations: 62^10 = 839 trillion
Time with GPU (8B hashes/sec): ~26.6 hours
Cost: ~$1-5 on cloud rental
```

**Argon2 (same scenario)**
```
Total combinations: 62^10 = 839 trillion
Time with GPU (3 hashes/sec): ~9.8 million years
Cost: Economically infeasible
```

### CPU vs GPU: Argon2 Levels the Playing Field
```
CPU: 1 GHz processor
- Can compute: 1 billion operations/second
- Argon2: ~10 hashes/second (CPU-optimized)

GPU: 1 THz processor (1000x faster)
- Can compute: 1 trillion operations/second
- Argon2: ~3 hashes/second (severely limited by memory)
- Only 3x-10x faster than CPU (not 1000x)
```

**Key Insight**: Argon2 forces attackers to use CPU power (expensive) instead of GPU power (cheap).

## Implementation Details

### Password Hashing During Registration
```javascript
// When user registers or admin creates user
const hashedPassword = await argon2.hash(password);
// Hash expires: never (salted and memory-hard)
// Storage: plaintext password never stored
```

### Password Verification During Login
```javascript
// During login
const passwordMatch = await argon2.verify(storedHash, userPassword);
// Returns: true or false (timing-safe comparison)
// Attack prevention: Constant time verification (prevents timing attacks)
```

### Timing Attack Prevention
The login endpoint includes a dummy hash verification even when user not found:
```javascript
if (rows.length === 0) {
  // Still hash to prevent timing attacks
  await argon2.verify(dummyHash, password).catch(() => {});
}
```
This prevents attackers from discovering valid usernames by measuring response times.

## Database Schema Considerations

### Password Field Size
```sql
CREATE TABLE users (
  ...
  password VARCHAR(255) NOT NULL,  -- Argon2 hashes are ~96 characters
  ...
);
```

### Backward Compatibility
When migrating from plaintext to Argon2:
1. Keep plaintext passwords in separate column initially
2. Hash them on first login
3. Update to hashed password
4. Can be done transparently without user notification

## Security Testing

### Test Case 1: Register a New User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "MySecurePassword123!",
    "role": "student",
    "email": "newuser@exam.com"
  }'
```

**Expected Result**: User created with ID returned

### Test Case 2: Verify Password is Hashed in Database
```bash
SELECT username, password FROM users WHERE username = 'newuser';
```

**Expected Result**: 
```
username  |  password
newuser   |  $argon2id$v=19$m=19456,t=2,p=1$...  (hash, NOT plaintext)
```

### Test Case 3: Login with Correct Password
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "MySecurePassword123!"
  }'
```

**Expected Result**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 6,
    "username": "newuser",
    "role": "student",
    "email": "newuser@exam.com"
  }
}
```

### Test Case 4: Login with Incorrect Password
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "WrongPassword123!"
  }'
```

**Expected Result**: HTTP 401
```json
{
  "message": "Invalid credentials"
}
```

### Test Case 5: Verify Hash Contents (Never Stored Plaintext)
```bash
SELECT COUNT(*) as plaintext_passwords
FROM users 
WHERE password NOT LIKE '$argon2%' AND username != 'admin1';
```

**Expected Result**: 0 (all new passwords are hashed)

### Test Case 6: Timing Attack Prevention
```bash
# Time how long it takes to check non-existent user
time curl -X POST http://localhost:5000/api/login \
  -d '{"username":"nonexistent","password":"test"}'

# Time how long it takes to check existing user with wrong password
time curl -X POST http://localhost:5000/api/login \
  -d '{"username":"student1","password":"wrongpass"}'
```

**Expected Result**: Both should take approximately the same time (~0.1-0.2s)

## Burp Suite Security Testing

### 1. Intercept Login Request
1. Open Burp Suite → Proxy → Intercept is on
2. In frontend, click login
3. Burp intercepts POST to /api/login
4. Request shows: `{"username":"...","password":"..."}`

### 2. Inspect Database Storage
1. Forward the request
2. Login succeeds
3. Check MySQL: `SELECT password FROM users WHERE id=1;`
4. Password field contains: `$argon2id$v=19$m=19456,t=2,p=1$...` (hash, not plaintext)

### 3. Test Hash Extraction Attack
1. Assume attacker obtains hash: `$argon2id$v=19$m=19456,t=2,p=1$sG5a...`
2. Try to crack offline with hashcat/john:
   ```bash
   hashcat -m 34500 hash.txt wordlist.txt
   # Speed: ~0.3 hashes/second (vs MD5's 8 billion)
   # 1 trillion guesses would take: ~100 million years
   ```

### 4. Verify No Plaintext Fallback
1. Create user with password "TestPassword123"
2. Intercept the registration request
3. Modify request to change password to different value
4. Verify both stored as hashes in DB
5. Check that original password no longer works for login

### 5. Password Update Security
1. Admin updates user password
2. Intercept PUT /api/users/1 request
3. Verify new password is hashed before storage
4. Check old password no longer works for login

## Performance Benchmarks

```
Operation              Time        Memory
password_creation     50-100ms     ~25 MB (temp)
password_verification 50-100ms     ~25 MB (temp)
database_storage      <1ms         132 bytes
```

**Login Flow Timing**:
- DB query: 1-5ms
- Argon2 verification: 50-100ms
- Response: ~100-110ms total

## Migration Strategy

For existing systems with plaintext passwords:

### Phase 1: Keep Plaintext (for compatibility)
```javascript
// Accept both hashed and plaintext during transition
if (hash.startsWith('$argon2')) {
  passwordMatch = await argon2.verify(hash, password);
} else {
  passwordMatch = (hash === password); // Legacy plaintext
}
```

### Phase 2: Hash on Each Login
```javascript
// If plaintext detected, re-hash and save
if (!hash.startsWith('$argon2')) {
  const newHash = await argon2.hash(password);
  await updatePassword(userId, newHash);
}
```

### Phase 3: Mandatory Full Migration
```javascript
// After all users have logged in once:
// Reject any plaintext passwords immediately
// Forces remaining users to reset password
```

## Argon2 Parameter Tuning (if needed)

### High Security (slower registration - recommended for critical accounts)
```javascript
// m: 65540 (64 MB)
// t: 3 iterations
// p: 1 thread
// ~300ms per hash
const hash = await argon2.hash(password, {
  memoryCost: 65540,
  timeCost: 3,
  parallelism: 1
});
```

### Balance (default - recommended)
```javascript
// m: 19456 (19 MB) - default
// t: 2 iterations - default
// p: 1 thread
// ~50-100ms per hash
const hash = await argon2.hash(password);
```

### Fast (high throughput - for testing only)
```javascript
// NOT RECOMMENDED FOR PRODUCTION
// m: 2048 (2 MB)
// t: 1 iteration
// p: 1 thread
// ~5ms per hash
const hash = await argon2.hash(password, {
  memoryCost: 2048,
  timeCost: 1,
  parallelism: 1
});
```

## Common Vulnerabilities to Avoid

### ❌ WRONG: Storing plaintext
```javascript
await pool.execute(
  "INSERT INTO users VALUES (?, ?, ?)",
  [username, plaintext_password, role]  // INSECURE!
);
```

### ✅ CORRECT: Always hash first
```javascript
const hashedPassword = await argon2.hash(plaintext_password);
await pool.execute(
  "INSERT INTO users VALUES (?, ?, ?)",
  [username, hashedPassword, role]  // SECURE!
);
```

### ❌ WRONG: Multiple hashes (double-salting is unnecessary)
```javascript
const hash1 = await argon2.hash(password);
const hash2 = await argon2.hash(hash1);  // DON'T DO THIS
```

### ✅ CORRECT: Single hash with automatic salt
```javascript
const hash = await argon2.hash(password);  // Automatically includes salt
```

### ❌ WRONG: Logging passwords
```javascript
console.log(`User ${username} logged in with password: ${password}`);  // NEVER!
```

### ✅ CORRECT: Log only non-sensitive info
```javascript
console.log(`[✅ ARGON2] User ${username} authenticated`);  // SECURE
```

## Further Reading

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 Official Documentation](https://argon2-cffi.readthedocs.io/)
- [Go-Crypto Argon2 Guide](https://godoc.org/golang.org/x/crypto/argon2)
- [Password Hashing Competition Winners](https://password-hashing.info/)

## Verification Checklist

After implementing Argon2, verify:
- [ ] New passwords stored as `$argon2id$` hashes
- [ ] Old plaintext passwords migrated or re-hashed
- [ ] Login verification uses `argon2.verify()`
- [ ] Password updates hash before storage
- [ ] Database field sized for Argon2 hashes (VARCHAR 255)
- [ ] No passwords logged in console or logs
- [ ] Timing attacks prevented (dummy hash verification)
- [ ] All tests pass (correct login, rejected wrong password)
- [ ] Burp Suite shows only hashes in database
