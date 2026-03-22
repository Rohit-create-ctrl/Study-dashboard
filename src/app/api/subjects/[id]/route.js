import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subject from '@/models/Subject';
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
    const { title, materials } = await req.json();

    await connectDB();
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (materials !== undefined) updateData.materials = materials;

    const subject = await Subject.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    return NextResponse.json({ subject }, { status: 200 });
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
    const subject = await Subject.findOneAndDelete({ _id: id, userId });

    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    return NextResponse.json({ message: 'Subject deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
