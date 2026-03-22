import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Fast JWT Helper using `jose` (Edge-compatible, no native deps).
 * Extracts and verifies the user ID from the 'token' cookie.
 */
export async function getUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (error) {
    console.error('Auth Helper JWT Error:', error.message);
    return null;
  }
}
