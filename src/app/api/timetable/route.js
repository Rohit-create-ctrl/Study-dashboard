import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Timetable from '@/models/Timetable';
import { getUserId } from '@/lib/auth';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const timetables = await Timetable.find({ userId });
    
    const formatted = {};
    timetables.forEach(t => {
      formatted[t.semester] = {
        classes: t.classes,
        files: t.files
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET Timetable Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { semester, classes, files } = body;
    if (!semester) return NextResponse.json({ success: false, error: 'Semester is required' }, { status: 400 });

    await dbConnect();
    
    const timetable = await Timetable.findOneAndUpdate(
      { userId, semester },
      { classes: classes || [], files: files || [] },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, data: timetable }, { status: 201 });
  } catch (error) {
    console.error("POST Timetable Error:", error?.message || error);
    if (error?.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  Field "${key}":`, error.errors[key].message);
      });
    }
    return NextResponse.json({ success: false, error: error?.message || "Failed to update timetable" }, { status: 500 });
  }
}
