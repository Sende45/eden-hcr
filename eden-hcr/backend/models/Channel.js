import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    expediteurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contenu: {
      type: String,
      required: true,
      trim: true
    },
    lu: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const channelSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    candidatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat'
    },

    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },

    contratId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contrats'
    },

    typeChannel: {
      type: String,
      enum: ['general', 'mission', 'contrat', 'support', 'administratif'],
      default: 'general'
    },

    messages: [messageSchema],

    lastMessage: {
      type: String,
      default: ''
    },

    lastMessageAt: {
      type: Date,
      default: Date.now
    },

    unread: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'channels'
  }
);

const Channel = mongoose.model('Channel', channelSchema);
export default Channel;