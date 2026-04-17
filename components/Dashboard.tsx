import React, { useMemo, useState, useEffect } from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Confetti from 'react-confetti';

interface DashboardProps {
  transactions: Transaction[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Calculate start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let totalIncome = 0;
    let totalExpense = 0;
    let todayExpense = 0;
    let weekExpense = 0;
    let hasTransactionToday = false;

    let currentMonthExpense = 0;
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach(t => {
      const amount = Number(t.amount);
      const tDate = new Date(t.date);
      
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        
        if (t.date === todayStr) {
          todayExpense += amount;
          hasTransactionToday = true;
        }
        
        if (tDate >= startOfWeek) {
          weekExpense += amount;
        }

        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          currentMonthExpense += amount;
        }
      }
    });

    return { totalIncome, totalExpense, todayExpense, weekExpense, hasTransactionToday, currentMonthExpense };
  }, [transactions]);

  useEffect(() => {
    // Show confetti if there's a transaction today and today's total expense is < $50
    if (stats.hasTransactionToday && stats.todayExpense < 50) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [stats.todayExpense, stats.hasTransactionToday]);

  const balance = stats.totalIncome - stats.totalExpense;
  const monthlyBudget = 2000; // Example fixed budget
  const budgetPercentage = Math.min((stats.currentMonthExpense / monthlyBudget) * 100, 100);
  const isOverBudget = stats.currentMonthExpense > monthlyBudget;

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week's Spending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.weekExpense.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">+${stats.totalIncome.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">-${stats.totalExpense.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Budget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: 'var(--tw-bg-opacity, white)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                No expense data to display
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center space-x-2 mb-6">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Spent so far</p>
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  ${stats.currentMonthExpense.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">${monthlyBudget}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  isOverBudget ? 'bg-red-500' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              {isOverBudget 
                ? `You are $${(stats.currentMonthExpense - monthlyBudget).toFixed(2)} over budget!` 
                : `You have $${(monthlyBudget - stats.currentMonthExpense).toFixed(2)} left for the month.`}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No recent transactions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;