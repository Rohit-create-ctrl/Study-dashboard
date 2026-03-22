import connectDB from '@/lib/db';
import StudySession from '@/models/StudySession';
import { getUserId } from '@/lib/auth';

// GET /api/sessions/[id]
export async function GET(request, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const studySession = await StudySession.findOne({ _id: id, userId }).populate('subjectId', 'title');
    if (!studySession) {
      return Response.json({ success: false, message: 'Session not found', data: null }, { status: 404 });
    }

    return Response.json({ success: true, data: studySession, message: 'Session fetched' });
  } catch (error) {
    console.error('[GET /api/sessions/[id]]', error);
    return Response.json({ success: false, message: 'Server error', data: null }, { status: 500 });
  }
}

// PUT /api/sessions/[id]
export async function PUT(request, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { duration, subjectId } = body;

    const updates = {};
    if (duration !== undefined) {
      if (isNaN(duration) || duration < 1) {
        return Response.json(
          { success: false, message: 'Duration must be >= 1', data: null },
          { status: 400 }
        );
      }
      updates.duration = Number(duration);
    }
    if (subjectId !== undefined) updates.subjectId = subjectId;

    await connectDB();

    const studySession = await StudySession.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!studySession) {
      return Response.json({ success: false, message: 'Session not found', data: null }, { status: 404 });
    }

    return Response.json({ success: true, data: studySession, message: 'Session updated' });
  } catch (error) {
    console.error('[PUT /api/sessions/[id]]', error);
    return Response.json({ success: false, message: 'Server error', data: null }, { status: 500 });
  }
}

// DELETE /api/sessions/[id]
export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const studySession = await StudySession.findOneAndDelete({ _id: id, userId });
    if (!studySession) {
      return Response.json({ success: false, message: 'Session not found', data: null }, { status: 404 });
    }

    return Response.json({ success: true, data: null, message: 'Session deleted' });
  } catch (error) {
    console.error('[DELETE /api/sessions/[id]]', error);
    return Response.json({ success: false, message: 'Server error', data: null }, { status: 500 });
  }
}
