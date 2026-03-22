import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StudySession from '@/models/StudySession';
import { getUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const sessions = await StudySession.find({ userId }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: sessions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { duration, date } = await req.json();
    if (!duration) return NextResponse.json({ error: 'Duration is required' }, { status: 400 });

    await connectDB();
    const session = await StudySession.create({
      duration,
      date: date || new Date(),
      userId,
    });
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
