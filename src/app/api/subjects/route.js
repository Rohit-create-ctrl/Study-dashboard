import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subject from '@/models/Subject';
import { getUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const subjects = await Subject.find({ userId });
    return NextResponse.json({ success: true, data: subjects }, { status: 200 });
  } catch (error) {
    console.error("GET Subjects Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { title, icon } = await req.json();
    // Removed the check for 'name' as it's replaced by 'title' and 'icon' is optional
    // if (!name) return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });

    await connectDB(); // Kept connectDB as dbConnect is not defined/imported
    const subject = await Subject.create({ title, icon, userId });
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error("POST Subjects Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create subject" }, { status: 500 });
  }
}
