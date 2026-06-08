import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: String },
  unread: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);