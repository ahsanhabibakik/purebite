import { SecurityService } from '@/lib/security'

describe('SecurityService', () => {
  describe('password hashing and verification', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123!'
      const hashedPassword = await SecurityService.hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it('should verify password correctly', async () => {
      const password = 'testPassword123!'
      const hashedPassword = await SecurityService.hashPassword(password)
      
      const isValid = await SecurityService.verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
      
      const isInvalid = await SecurityService.verifyPassword('wrongPassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe('token generation', () => {
    it('should generate secure tokens', () => {
      const token1 = SecurityService.generateSecureToken()
      const token2 = SecurityService.generateSecureToken()
      
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
      expect(token1.length).toBe(64) // 32 bytes = 64 hex chars
    })

    it('should generate secure tokens with custom length', () => {
      const token = SecurityService.generateSecureToken(16)
      expect(token.length).toBe(32) // 16 bytes = 32 hex chars
    })

    it('should generate OTP correctly', () => {
      const otp1 = SecurityService.generateOTP()
      const otp2 = SecurityService.generateOTP(8)
      
      expect(otp1.length).toBe(6)
      expect(otp2.length).toBe(8)
      expect(/^\d+$/.test(otp1)).toBe(true) // Only digits
      expect(/^\d+$/.test(otp2)).toBe(true)
    })
  })

  describe('input sanitization', () => {
    it('should sanitize HTML input', () => {
      const maliciousInput = '<script>alert("xss")</script><p>Hello</p>'
      const sanitized = SecurityService.sanitizeInput(maliciousInput)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('&lt;script&gt;')
    })

    it('should sanitize email correctly', () => {
      const validEmail = 'test@example.com'
      const invalidEmail = '<script>@example.com'
      
      expect(SecurityService.sanitizeEmail(validEmail)).toBe('test@example.com')
      expect(SecurityService.sanitizeEmail(invalidEmail)).toBe('')
    })

    it('should sanitize phone numbers', () => {
      const phone = '+1-234-567-8900 ext.123'
      const sanitized = SecurityService.sanitizePhone(phone)
      
      expect(sanitized).toMatch(/^[\d+\-\s()]+$/)
      expect(sanitized.length).toBeLessThanOrEqual(20)
    })

    it('should strip HTML tags', () => {
      const htmlInput = '<div><p>Hello <strong>World</strong></p></div>'
      const stripped = SecurityService.stripHTML(htmlInput)
      
      expect(stripped).toBe('Hello World')
      expect(stripped).not.toContain('<')
      expect(stripped).not.toContain('>')
    })
  })

  describe('password strength validation', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'MyStr0ng!Password'
      const result = SecurityService.validatePasswordStrength(strongPassword)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(4)
      expect(result.feedback).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const weakPassword = '123456'
      const result = SecurityService.validatePasswordStrength(weakPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(4)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should detect common patterns', () => {
      const commonPassword = 'password123'
      const result = SecurityService.validatePasswordStrength(commonPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('সাধারণ পাসওয়ার্ড প্যাটার্ন এড়িয়ে চলুন')
    })

    it('should require minimum length', () => {
      const shortPassword = 'Ab1!'
      const result = SecurityService.validatePasswordStrength(shortPassword)
      
      expect(result.feedback).toContain('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
    })
  })

  describe('rate limiting', () => {
    it('should allow requests within limit', () => {
      const rateLimiter = SecurityService.rateLimit({
        windowMs: 60000,
        maxRequests: 5
      })
      
      const result1 = rateLimiter('test-ip')
      const result2 = rateLimiter('test-ip')
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.remaining).toBe(3)
    })

    it('should block requests when limit exceeded', () => {
      const rateLimiter = SecurityService.rateLimit({
        windowMs: 60000,
        maxRequests: 2
      })
      
      // Make requests up to limit
      rateLimiter('test-ip-2')
      rateLimiter('test-ip-2')
      
      // This should be blocked
      const result = rateLimiter('test-ip-2')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })

  describe('file upload validation', () => {
    it('should validate file size', () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      })
      
      const result = SecurityService.validateFileUpload(largeFile, {
        maxSize: 5 * 1024 * 1024 // 5MB
      })
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('ফাইল সাইজ')
    })

    it('should validate file type', () => {
      const textFile = new File(['content'], 'test.txt', {
        type: 'text/plain'
      })
      
      const result = SecurityService.validateFileUpload(textFile, {
        allowedTypes: ['image/jpeg', 'image/png']
      })
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('ধরনের ফাইল')
    })

    it('should validate file extension', () => {
      const file = new File(['content'], 'test.exe', {
        type: 'image/jpeg' // Mismatched type and extension
      })
      
      const result = SecurityService.validateFileUpload(file, {
        allowedExtensions: ['.jpg', '.jpeg', '.png']
      })
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('এক্সটেনশন')
    })

    it('should accept valid files', () => {
      const validFile = new File(['image data'], 'test.jpg', {
        type: 'image/jpeg'
      })
      
      const result = SecurityService.validateFileUpload(validFile)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('CSRF token validation', () => {
    it('should generate CSRF tokens', () => {
      const token1 = SecurityService.generateCSRFToken()
      const token2 = SecurityService.generateCSRFToken()
      
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
    })
  })

  describe('honeypot validation', () => {
    it('should accept empty honeypot field', () => {
      expect(SecurityService.validateHoneypot('')).toBe(true)
      expect(SecurityService.validateHoneypot(undefined as any)).toBe(true)
    })

    it('should reject filled honeypot field', () => {
      expect(SecurityService.validateHoneypot('bot-filled-this')).toBe(false)
    })
  })

  describe('IP address utilities', () => {
    it('should detect private IP addresses', () => {
      expect(SecurityService.isPrivateIP('192.168.1.1')).toBe(true)
      expect(SecurityService.isPrivateIP('10.0.0.1')).toBe(true)
      expect(SecurityService.isPrivateIP('172.16.0.1')).toBe(true)
      expect(SecurityService.isPrivateIP('127.0.0.1')).toBe(true)
      expect(SecurityService.isPrivateIP('8.8.8.8')).toBe(false)
    })
  })

  describe('security headers', () => {
    it('should return proper security headers', () => {
      const headers = SecurityService.getSecurityHeaders()
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('1; mode=block')
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'")
    })
  })

  describe('session ID generation', () => {
    it('should generate unique session IDs', () => {
      const id1 = SecurityService.generateSessionId()
      const id2 = SecurityService.generateSessionId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBe(64) // 32 bytes = 64 hex chars
    })
  })

  describe('data hashing for logging', () => {
    it('should hash sensitive data for logging', () => {
      const sensitiveData = 'user@example.com'
      const hashed = SecurityService.hashForLogging(sensitiveData)
      
      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(sensitiveData)
      expect(hashed.length).toBe(8) // First 8 chars of SHA256
    })
  })
})