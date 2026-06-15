// src/models/user.ts - ACTUALIZAR
import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Extender Document para incluir métodos personalizados
export interface User extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  company?: string;
  businessArea?: string;
  interests: string[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  
  //Declarar el método personalizado
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  businessArea: {
    type: String,
    trim: true,
    maxlength: 80
  },
  interests: {
    type: [String],
    default: [],
    validate: {
      validator: function(value: string[]) {
        return value.length <= 10;
      },
      message: 'No puedes cargar mÃ¡s de 10 intereses'
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 300
  },
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error(`Error hashing password: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// ✅ El método ahora está declarado en la interfaz
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<User>("User", userSchema);
