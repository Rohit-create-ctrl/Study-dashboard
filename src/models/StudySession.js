import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema(
  {
    duration: {
      type: Number, // duration in minutes
      required: [true, 'Duration is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

const StudySession =
  mongoose.models.StudySession ||
  mongoose.model('StudySession', StudySessionSchema);

export default StudySession;
