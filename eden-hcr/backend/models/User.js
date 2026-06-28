import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire."],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caracteres."],
      select: false
    },

    role: {
      type: String,
      enum: ['admin', 'superadmin', 'extra', 'etablissement', 'client'],
      required: [true, "Le role de l'utilisateur est obligatoire."],
      default: 'extra',
      index: true
    },

    // ✅ Optionnel pour tous les rôles — la validation métier est dans le controller
    nom: {
      type: String,
      trim: true,
      default: ''
    },

    prenom: {
      type: String,
      trim: true,
      default: ''
    },

    // ✅ Optionnel — la validation métier est dans le controller
    societe: {
      type: String,
      trim: true,
      default: ''
    },

    telephone: {
      type: String,
      default: '',
      trim: true
    },

    photoProfil: {
      type: String,
      default: ''
    },

    candidatRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidat',
      default: null
    },

    etablissementRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etablissement',
      default: null
    },

    statutCompte: {
      type: String,
      enum: ['actif', 'suspendu', 'en_attente'],
      default: 'actif',
      index: true
    },

    derniereConnexion: {
      type: Date,
      default: null
    },

    disponibilites: [
      {
        type: Date
      }
    ]
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// ✅ Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Erreur hash password :', error);
    next(error);
  }
});

// ✅ Comparaison mot de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Erreur comparaison password :', error);
    return false;
  }
};

// ✅ Masquer les données sensibles en sortie JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// ✅ Index composés
userSchema.index({ email: 1, role: 1 });
userSchema.index({ nom: 1, prenom: 1 });

const User = mongoose.model('User', userSchema);

export default User;