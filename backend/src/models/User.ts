import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '../types';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model<IUser>('User', userSchema);
