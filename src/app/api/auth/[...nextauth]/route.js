import { handlers } from '@/lib/auth';

// Expose NextAuth's GET and POST handlers for the [...nextauth] catch-all route
export const { GET, POST } = handlers;
