import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Transaction, Page } from './types';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import AIInsights from './components/AIInsights';
import Button from './components/Button';
import { Plus, Mic } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Load session and data
  useEffect(() => {
    const session = StorageService.getSession();
    if (session) {
      setUser(session.user);
      loadTransactions(session.user.id);
    }
    setIsLoading(false);
  }, []);

  const loadTransactions = async (userId: string) => {
    const data = await StorageService.getTransactions(userId);
    setTransactions(data);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadTransactions(loggedInUser.id);
  };

  const handleLogout = async () => {
    await StorageService.logout();
    setUser(null);
    setTransactions([]);
    setCurrentPage('dashboard');
  };

  const handleAddTransaction = async (data: Omit<Transaction, 'id'>) => {
    await StorageService.addTransaction(data);
    if (user) await loadTransactions(user.id);
    setShowAddModal(false);
  };

  const handleEditTransaction = async (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
        await StorageService.updateTransaction({ ...data, id: editingTransaction.id });
        if (user) await loadTransactions(user.id);
        setEditingTransaction(undefined);
        setShowAddModal(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await StorageService.deleteTransaction(id);
      if (user) await loadTransactions(user.id);
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (user) {
      await StorageService.deleteAllTransactions(user.id);
      await loadTransactions(user.id);
    }
  };

  const openAddModal = () => {
    setEditingTransaction(undefined);
    setShowAddModal(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setShowAddModal(true);
  };

  const handleNaturalLanguageAdd = async () => {
    const input = prompt("Enter transaction (e.g., 'Spent $50 on groceries today')");
    if (!input || !user) return;
    
    // Quick visual feedback
    const originalText = document.title;
    document.title = "Processing AI...";
    
    try {
        const parsed = await GeminiService.parseNaturalLanguage(input);
        if (parsed && parsed.amount && parsed.description) {
            await StorageService.addTransaction({
                userId: user.id,
                amount: parsed.amount,
                description: parsed.description,
                category: parsed.category || 'Other',
                type: parsed.type || 'expense',
                date: parsed.date || new Date().toISOString().split('T')[0]
            });
            await loadTransactions(user.id);
            alert("Transaction added via AI!");
        } else {
            alert("Could not understand transaction.");
        }
    } catch (e) {
        console.error(e);
        alert("AI processing failed.");
    } finally {
        document.title = originalText;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">Loading SmartSpend...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Auth onLogin={handleLogin} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Layout user={user} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {currentPage === 'reports' ? 'AI Insights' : currentPage}
              </h1>
              <div className="flex space-x-2">
                  {GeminiService.isAvailable && (currentPage === 'transactions' || currentPage === 'dashboard') && (
                       <Button variant="secondary" onClick={handleNaturalLanguageAdd} className="hidden md:flex">
                          <Mic className="w-4 h-4 mr-2" />
                          Quick Add (AI)
                       </Button>
                  )}
                  <Button onClick={openAddModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
              </div>
            </div>

            {currentPage === 'dashboard' && <Dashboard transactions={transactions} />}
            
            {currentPage === 'transactions' && (
              <TransactionList 
                transactions={transactions} 
                onDelete={handleDeleteTransaction}
                onEdit={openEditModal}
                onDeleteAll={handleDeleteAllTransactions}
              />
            )}

            {currentPage === 'reports' && <AIInsights transactions={transactions} />}

            {/* Modal Overlay */}
            <AnimatePresence>
              {showAddModal && (
                <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 flex items-center justify-center z-50 p-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                  >
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <TransactionForm 
                      initialData={editingTransaction}
                      userId={user.id}
                      onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                      onCancel={() => setShowAddModal(false)}
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </Layout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}