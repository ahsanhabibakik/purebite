import { registerOTel } from '@vercel/otel';

export function register() {
  if (process.env.NODE_ENV === 'production') {
    registerOTel({ serviceName: 'purebite' });
  }
}