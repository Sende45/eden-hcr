import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "L'adresse email est obligatoire."],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est obligatoire."],
    minlength: [6, "Le mot de passe doit contenir au moins 6 caractères."]
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin', 'extra', 'etablissement'],
    required: [true, "Le rôle de l'utilisateur est obligatoire."]
  },
  nom: { 
    type: String, 
    trim: true,
    // Rend le nom obligatoire uniquement si l'utilisateur est un extra
    required: function() { return this.role === 'extra'; }
  },
  prenom: { 
    type: String, 
    trim: true,
    // Rend le prénom obligatoire uniquement si l'utilisateur est un extra
    required: function() { return this.role === 'extra'; }
  },
  candidatRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidat'
  },
  etablissementRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etablissement'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparaison mot de passe lors du login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);