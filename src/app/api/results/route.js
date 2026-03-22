import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';
import { getUserId } from '@/lib/auth';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const results = await Result.find({ userId });
    
    // Convert to the format expected by the frontend Record<number, SemesterData>
    const formattedResults = {};
    results.forEach(res => {
      formattedResults[res.semester] = {
        entries: res.entries,
        files: res.files
      };
    });

    return NextResponse.json({ success: true, data: formattedResults });
  } catch (error) {
    console.error("GET Results Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch results" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { semester, entries, files } = await req.json();
    if (!semester) return NextResponse.json({ success: false, error: 'Semester is required' }, { status: 400 });

    await dbConnect();
    
    const result = await Result.findOneAndUpdate(
      { userId, semester },
      { entries, files },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("POST Results Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update results" }, { status: 500 });
  }
}
