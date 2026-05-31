import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Role } from '../types';
import { signToken } from '../utils/jwt';

const SALT_ROUNDS = 10;

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const role = data.role || Role.BORROWER;
  if (role !== Role.BORROWER) {
    throw new Error('Only borrower self-registration is allowed');
  }

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
    role,
  });

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
