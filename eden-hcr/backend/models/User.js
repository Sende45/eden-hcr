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
      index: true // ✅ Ajout pour accélérer les recherches
    },

    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire."],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères."],
      select: false // ✅ Ne pas retourner le mot de passe par défaut
    },

    role: {
      type: String,
      enum: ['admin', 'superadmin', 'extra', 'etablissement', 'client'],
      required: [true, "Le rôle de l'utilisateur est obligatoire."],
      default: 'extra',
      index: true
    },

    nom: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'extra' || this.role === 'client';
      },
      default: ''
    },

    prenom: {
      type: String,
      trim: true,
      required: function () {
        return this.role === 'extra' || this.role === 'client';
      },
      default: ''
    },

    societe: {
      type: String,
      trim: true,
      default: '',
      required: function () {
        return this.role === 'client' || this.role === 'etablissement';
      }
    },

    // ✅ Ajout du champ telephone pour tous les rôles
    telephone: {
      type: String,
      default: '',
      trim: true
    },

    // ✅ Ajout du champ photoProfil pour tous les rôles
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

    // ✅ Ajout du champ date de création
    createdAt: {
      type: Date,
      default: Date.now
    },

    // ✅ Ajout du champ updatedAt (géré automatiquement par timestamps)
    // ✅ Ajout des timestamps pour createdAt et updatedAt
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// ✅ Middleware pre-save avec meilleure gestion d'erreurs
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('❌ Erreur hash password :', error);
    next(error);
  }
});

// ✅ Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) {
    return false;
  }
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('❌ Erreur comparaison password :', error);
    return false;
  }
};

// ✅ Méthode pour masquer les données sensibles
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// ✅ Index composé pour les recherches fréquentes
userSchema.index({ email: 1, role: 1 });
userSchema.index({ nom: 1, prenom: 1 });

const User = mongoose.model('User', userSchema);

export default User;