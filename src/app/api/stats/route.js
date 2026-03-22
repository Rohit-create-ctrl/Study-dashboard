import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import StudySession from '@/models/StudySession';
import Task from '@/models/Task';
import { getUserId } from '@/lib/auth';


export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // 1. Total study hours
    const sessions = await StudySession.find({ userId });
    const totalMinutes = sessions.reduce((acc, sess) => acc + sess.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // 2. Completed tasks
    const completedTasks = await Task.countDocuments({ userId, completed: true });

    // 3. Streak calculation
    const sessionDates = sessions
      .map(s => new Date(s.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
      .map(d => new Date(d))
      .sort((a, b) => b - a); // Newest first

    let streak = 0;
    if (sessionDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastSessionDate = new Date(sessionDates[0]);
      lastSessionDate.setHours(0, 0, 0, 0);

      // Check if the last session was today or yesterday
      const diffTime = Math.abs(today - lastSessionDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < sessionDates.length - 1; i++) {
          const current = new Date(sessionDates[i]);
          const next = new Date(sessionDates[i + 1]);
          current.setHours(0, 0, 0, 0);
          next.setHours(0, 0, 0, 0);

          const diff = Math.abs(current - next);
          const dayDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

          if (dayDiff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      totalStudyHours: parseFloat(totalHours),
      completedTasks,
      streak,
    }, { status: 200 });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
