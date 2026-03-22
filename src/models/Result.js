import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    entries: [
      {
        id: String,
        subject: String,
        marks: String,
      }
    ],
    files: [
      {
        id: String,
        fileName: String,
        fileType: String,
        fileUrl: String,
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
