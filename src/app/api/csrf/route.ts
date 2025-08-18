import { getCSRFTokenHandler } from '@/lib/csrf';

export async function GET() {
  return getCSRFTokenHandler();
}