import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Role } from '../types';

dotenv.config();

const SEED_USERS = [
  { name: 'Admin User', email: 'admin@example.com', role: Role.ADMIN },
  { name: 'Sales Executive', email: 'sales@example.com', role: Role.SALES },
  { name: 'Sanction Officer', email: 'sanction@example.com', role: Role.SANCTION },
  { name: 'Disbursement Officer', email: 'disbursement@example.com', role: Role.DISBURSEMENT },
  { name: 'Collection Officer', email: 'collection@example.com', role: Role.COLLECTION },
  { name: 'Borrower User', email: 'borrower@example.com', role: Role.BORROWER },
];

const PASSWORD = 'Password@123';

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const hashed = await bcrypt.hash(PASSWORD, 10);

  for (const u of SEED_USERS) {
    await User.findOneAndUpdate(
      { email: u.email },
      { name: u.name, email: u.email, password: hashed, role: u.role },
      { upsert: true, new: true }
    );
    console.log(`Seeded: ${u.email} (${u.role})`);
  }

  console.log('\nAll users seeded with password: Password@123');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
