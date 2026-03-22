import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "BookOpen",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    materials: [
      {
        id: String,
        name: String,
        type: String,
        url: String,
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
