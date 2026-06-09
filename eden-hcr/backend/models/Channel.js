import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      enum: [
        'admin',
        'superadmin',
        'extra',
        'etablissement'
      ]
    },

    avatar: {
      type: String,
      default: ''
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

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
      enum: [
        'general',
        'mission',
        'contrat',
        'support',
        'administratif'
      ],
      default: 'general'
    },

    lastMessage: {
      type: String,
      default: ''
    },

    unread: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'channels'
  }
);

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;