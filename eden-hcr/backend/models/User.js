import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
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
      // ← AJOUT : 'client' dans l'enum
      enum: ['admin', 'superadmin', 'extra', 'etablissement', 'client'],
      required: [true, "Le rôle de l'utilisateur est obligatoire."]
    },

    nom: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'extra';
      }
    },

    prenom: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'extra';
      }
    },

    // ← AJOUT : nom de société pour les clients
    societe: {
      type: String,
      trim: true,
      default: ''
    },

    candidatRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat'
    },

    etablissementRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etablissement'
    },

    telephone: {
      type: String,
      default: ''
    },

    photoProfil: {
      type: String,
      default: ''
    },

    statutCompte: {
      type: String,
      enum: ['actif', 'suspendu', 'en_attente'],
      default: 'actif'
    },

    derniereConnexion: {
      type: Date
    },

    disponibilites: [
      {
        type: Date
      }
    ],

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function () {
  try {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Erreur hash password :', error);
    throw error;
  }
});

// Comparaison mot de passe lors du login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;