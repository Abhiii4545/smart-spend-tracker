import React, { useState } from 'react';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';
import Button from './Button';
import Input from './Input';
import { GeminiService } from '../services/gemini';
import { Sparkles } from 'lucide-react';

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSubmit, onCancel, userId }) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'userId'>>({
    amount: initialData?.amount || 0,
    category: initialData?.category || 'Food & Drink',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    type: initialData?.type || 'expense',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, userId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmartCategorize = async () => {
    if (!formData.description) return;
    setIsAnalyzing(true);
    try {
      const result = await GeminiService.categorizeTransaction(formData.description);
      setFormData(prev => ({
        ...prev,
        category: result.category,
        type: result.type
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-4 mb-4">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'expense' })}
          className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-colors ${
            formData.type === 'expense' 
              ? 'bg-red-100 text-red-800 ring-2 ring-red-500' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'income' })}
          className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-colors ${
            formData.type === 'income' 
              ? 'bg-green-100 text-green-800 ring-2 ring-green-500' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Income
        </button>
      </div>

      <Input
        label="Amount ($)"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
        required
      />

      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <Input
            label="Description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        {GeminiService.isAvailable && (
          <div className="pt-6">
            <button
              type="button"
              onClick={handleSmartCategorize}
              disabled={isAnalyzing || !formData.description}
              className="flex items-center justify-center px-3 py-2 border border-indigo-200 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              title="Auto-categorize with AI"
            >
              <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Save Transaction</Button>
      </div>
    </form>
  );
};

export default TransactionForm;