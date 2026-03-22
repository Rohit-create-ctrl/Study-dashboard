import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    classes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    files: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

// Delete cached model to ensure schema changes take effect during hot-reload
delete mongoose.models.Timetable;

export default mongoose.model('Timetable', TimetableSchema);
