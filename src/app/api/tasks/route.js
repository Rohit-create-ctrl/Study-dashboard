import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    await connectDB();
    const query = { userId };
    if (subjectId) query.subjectId = subjectId;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (error) {
    console.error("GET Tasks Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { title, subjectId, completed } = await req.json();
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    await connectDB();
    const task = await Task.create({
      title,
      subjectId,
      userId,
      completed: completed || false,
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
