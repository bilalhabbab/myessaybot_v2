import mongoose from 'mongoose';

const EssaySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Essay = mongoose.model('Essay', EssaySchema);
export default Essay;