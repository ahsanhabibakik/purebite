import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

// CSRF token configuration
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-csrf-secret';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

interface CSRFTokenData {
  token: string;
  timestamp: number;
  sessionId?: string;
}

/**
 * Generate a CSRF token for the current session
 */
export function generateCSRFToken(sessionId?: string): string {
  const randomBytes = crypto.randomBytes(CSRF_TOKEN_LENGTH);
  const timestamp = Date.now();
  
  const tokenData: CSRFTokenData = {
    token: randomBytes.toString('hex'),
    timestamp,
    sessionId,
  };
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(JSON.stringify(tokenData));
  const signature = hmac.digest('hex');
  
  // Combine token data and signature
  const csrfToken = Buffer.from(JSON.stringify({
    ...tokenData,
    signature
  })).toString('base64');
  
  return csrfToken;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, sessionId?: string): boolean {
  try {
    // Decode the token
    const decodedData = JSON.parse(Buffer.from(token, 'base64').toString());
    const { signature, ...tokenData } = decodedData;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(JSON.stringify(tokenData));
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('CSRF token signature verification failed');
      return false;
    }
    
    // Check expiry
    const now = Date.now();
    if (now - tokenData.timestamp > CSRF_TOKEN_EXPIRY) {
      console.error('CSRF token expired');
      return false;
    }
    
    // Check session ID if provided
    if (sessionId && tokenData.sessionId && tokenData.sessionId !== sessionId) {
      console.error('CSRF token session ID mismatch');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('CSRF token verification error:', error);
    return false;
  }
}

/**
 * Extract CSRF token from request headers or body
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // Check headers first
  const headerToken = request.headers.get('x-csrf-token') || 
                     request.headers.get('x-xsrf-token');
  
  if (headerToken) {
    return headerToken;
  }
  
  // For form submissions, the token might be in the body
  // This would need to be handled by the calling function
  return null;
}

/**
 * CSRF protection middleware function
 */
export async function validateCSRFToken(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
  sessionId?: string;
}> {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }
  
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id;
    
    // Extract CSRF token
    const csrfToken = extractCSRFToken(request);
    
    if (!csrfToken) {
      return {
        valid: false,
        error: 'CSRF token অনুপস্থিত। পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।'
      };
    }
    
    // Verify token
    const isValid = verifyCSRFToken(csrfToken, sessionId);
    
    if (!isValid) {
      return {
        valid: false,
        error: 'অবৈধ CSRF token। পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।'
      };
    }
    
    return {
      valid: true,
      sessionId
    };
    
  } catch (error) {
    console.error('CSRF validation error:', error);
    return {
      valid: false,
      error: 'নিরাপত্তা যাচাইকরণে সমস্যা হয়েছে'
    };
  }
}

/**
 * Create a CSRF protection decorator for API routes
 */
export function withCSRFProtection<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest;
    
    // Validate CSRF token
    const csrfValidation = await validateCSRFToken(request);
    
    if (!csrfValidation.valid) {
      return new Response(
        JSON.stringify({
          error: csrfValidation.error,
          code: 'CSRF_VALIDATION_FAILED'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Call the original handler
    return handler(...args);
  };
}

/**
 * API endpoint to generate CSRF token
 */
export async function getCSRFTokenHandler(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id;
    
    const token = generateCSRFToken(sessionId);
    
    return new Response(
      JSON.stringify({
        csrfToken: token,
        expiresIn: CSRF_TOKEN_EXPIRY,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return new Response(
      JSON.stringify({
        error: 'CSRF token তৈরি করতে সমস্যা হয়েছে',
        code: 'CSRF_GENERATION_ERROR'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}