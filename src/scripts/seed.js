const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// Define Models inline for the script
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const SubjectSchema = new mongoose.Schema({
  title: String,
  icon: String,
  userId: mongoose.Schema.Types.ObjectId,
});
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

const TaskSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
  subjectId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
});
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  subjectId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
});
const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clean existing data
    await User.deleteMany({ email: 'test@example.com' });
    
    // Create Test User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test Scholar',
      email: 'test@example.com',
      password: hashedPassword
    });
    console.log('User created: test@example.com / password123');

    // Create Subjects
    const subjects = await Subject.insertMany([
      { title: 'Advanced Mathematics', icon: 'Calculator', userId: user._id },
      { title: 'Computer Science', icon: 'Code', userId: user._id },
      { title: 'Physics II', icon: 'Zap', userId: user._id },
      { title: 'Organic Chemistry', icon: 'FlaskConical', userId: user._id }
    ]);
    console.log('Subjects created');

    // Create Tasks
    await Task.insertMany([
      { title: 'Complete Calculus Assignment', completed: false, subjectId: subjects[0]._id, userId: user._id },
      { title: 'Review Component Lifecycle', completed: true, subjectId: subjects[1]._id, userId: user._id },
      { title: 'Prepare Lab Report', completed: false, subjectId: subjects[2]._id, userId: user._id }
    ]);
    console.log('Tasks created');

    // Create a sample Note
    await Note.create({
      title: 'React Fundamentals',
      content: 'Remember to use properly structured state for complex dashboard interactions.',
      subjectId: subjects[1]._id,
      userId: user._id
    });
    console.log('Note created');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
