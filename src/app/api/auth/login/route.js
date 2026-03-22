import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user and include password field
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT with jose (fast, Edge-compatible)
    const token = await new SignJWT({ userId: user._id.toString(), email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Set cookie using Next.js headers API
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email }
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
