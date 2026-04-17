export interface User {
  id: string;
  username: string;
  email: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
  type: TransactionType;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Navigation types
export type Page = 'dashboard' | 'reports' | 'transactions' | 'settings';
