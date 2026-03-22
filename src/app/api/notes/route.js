import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { getUserId } from '@/lib/auth';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const query = { userId };
    if (subjectId) query.subjectId = subjectId;

    await dbConnect();
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("GET Notes Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { title, content, subjectId } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    await dbConnect();
    const note = await Note.create({
      title,
      content,
      subjectId,
      userId,
    });
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    console.error("POST Notes Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}
