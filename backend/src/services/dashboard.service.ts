import { User } from '../models/User';
import { BorrowerProfile } from '../models/BorrowerProfile';
import { Loan } from '../models/Loan';
import { Role, LoanStatus } from '../types';

export const getSalesLeads = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const borrowers = await User.find({ role: Role.BORROWER }).select('name email createdAt');
  const profiles = await BorrowerProfile.find().select('userId');
  const loans = await Loan.find({
    status: { $ne: LoanStatus.LEAD },
    borrowerId: { $in: borrowers.map((b) => b._id) },
  }).select('borrowerId');

  const appliedBorrowerIds = new Set(loans.map((l) => l.borrowerId.toString()));
  const profileUserIds = new Set(profiles.map((p) => p.userId.toString()));

  let leads = borrowers.filter((b) => {
    const id = b._id.toString();
    return !appliedBorrowerIds.has(id);
  });

  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(
      (b) => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
    );
  }

  const total = leads.length;
  const paginated = leads.slice(skip, skip + limit).map((b) => ({
    id: b._id,
    name: b.name,
    email: b.email,
    registrationDate: b.createdAt,
    hasProfile: profileUserIds.has(b._id.toString()),
  }));

  return { data: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getSanctionQueue = async () => {
  return Loan.find({ status: LoanStatus.APPLIED })
    .populate('borrowerId', 'name email')
    .sort({ createdAt: -1 });
};

export const getDisbursementQueue = async () => {
  return Loan.find({ status: LoanStatus.SANCTIONED })
    .populate('borrowerId', 'name email')
    .populate('sanctionedBy', 'name email')
    .sort({ sanctionedAt: -1 });
};

export const getCollectionQueue = async () => {
  return Loan.find({ status: LoanStatus.DISBURSED })
    .populate('borrowerId', 'name email')
    .sort({ disbursedAt: -1 });
};

export const getAdminStats = async () => {
  const [totalUsers, totalLoans, applied, sanctioned, disbursed, closed, rejected] =
    await Promise.all([
      User.countDocuments(),
      Loan.countDocuments(),
      Loan.countDocuments({ status: LoanStatus.APPLIED }),
      Loan.countDocuments({ status: LoanStatus.SANCTIONED }),
      Loan.countDocuments({ status: LoanStatus.DISBURSED }),
      Loan.countDocuments({ status: LoanStatus.CLOSED }),
      Loan.countDocuments({ status: LoanStatus.REJECTED }),
    ]);

  return {
    totalUsers,
    totalLoans,
    applied,
    sanctioned,
    disbursed,
    closed,
    rejected,
  };
};
