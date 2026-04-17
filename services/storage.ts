import { User, Transaction, AuthResponse } from '../types';

const USERS_KEY = 'smartspend_users';
const TRANSACTIONS_KEY = 'smartspend_transactions';
const SESSION_KEY = 'smartspend_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  // --- Auth Methods ---

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password, // In a real app, hash this!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const user: User = { id: newUser.id, username: newUser.username, email: newUser.email };
    const token = `mock-jwt-${newUser.id}`;
    
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    return { user, token };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];

    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const user: User = { id: foundUser.id, username: foundUser.username, email: foundUser.email };
    const token = `mock-jwt-${foundUser.id}`;

    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    return { user, token };
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(SESSION_KEY);
  },

  getSession(): { user: User, token: string } | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // --- Transaction Methods ---

  async getTransactions(userId: string): Promise<Transaction[]> {
    await delay(300);
    const allTransactionsStr = localStorage.getItem(TRANSACTIONS_KEY);
    const allTransactions: Transaction[] = allTransactionsStr ? JSON.parse(allTransactionsStr) : [];
    return allTransactions.filter(t => t.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await delay(300);
    const allTransactionsStr = localStorage.getItem(TRANSACTIONS_KEY);
    const allTransactions: Transaction[] = allTransactionsStr ? JSON.parse(allTransactionsStr) : [];

    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };

    allTransactions.push(newTransaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
    return newTransaction;
  },

  async updateTransaction(updatedTransaction: Transaction): Promise<Transaction> {
    await delay(300);
    const allTransactionsStr = localStorage.getItem(TRANSACTIONS_KEY);
    let allTransactions: Transaction[] = allTransactionsStr ? JSON.parse(allTransactionsStr) : [];

    allTransactions = allTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
    return updatedTransaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    await delay(300);
    const allTransactionsStr = localStorage.getItem(TRANSACTIONS_KEY);
    let allTransactions: Transaction[] = allTransactionsStr ? JSON.parse(allTransactionsStr) : [];

    allTransactions = allTransactions.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
  },

  async deleteAllTransactions(userId: string): Promise<void> {
    await delay(300);
    const allTransactionsStr = localStorage.getItem(TRANSACTIONS_KEY);
    let allTransactions: Transaction[] = allTransactionsStr ? JSON.parse(allTransactionsStr) : [];

    allTransactions = allTransactions.filter(t => t.userId !== userId);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
  }
};
