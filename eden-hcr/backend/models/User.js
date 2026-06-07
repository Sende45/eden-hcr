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
    enum: ['admin', 'extra', 'etablissement'],
    required: [true, "Le rôle de l'utilisateur est obligatoire."]
  },
  // Références optionnelles selon le type de compte
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
  collection: 'users'
});

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe lors du login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);