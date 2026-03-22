import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Note from '@/models/Note';
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

export async function PUT(req, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { ...body },
      { new: true }
    );

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    await connectDB();
    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
