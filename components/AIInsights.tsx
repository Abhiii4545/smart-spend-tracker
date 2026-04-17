import React, { useState } from 'react';
import { Transaction } from '../types';
import { GeminiService } from '../services/gemini';
import { Sparkles, Brain, Lightbulb } from 'lucide-react';
import Button from './Button';

interface AIInsightsProps {
  transactions: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const result = await GeminiService.analyzeSpending(transactions);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  if (!GeminiService.isAvailable) {
     return (
        <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">AI Features Unavailable</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Please configure the <code className="bg-gray-100 px-1 py-0.5 rounded">API_KEY</code> environment variable to unlock Gemini AI insights.
            </p>
        </div>
     )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Smart Financial Assistant</h2>
            </div>
            <p className="text-indigo-100 mb-6 max-w-xl">
                Leverage Gemini AI to analyze your spending patterns, categorize messy bank descriptions, and get actionable advice to improve your financial health.
            </p>
            <Button 
                onClick={generateReport} 
                disabled={loading}
                variant="secondary"
                className="text-indigo-600 hover:bg-indigo-50 border-0 shadow-md font-bold"
            >
                {loading ? 'Analyzing...' : 'Generate Spending Report'}
            </Button>
        </div>
      </div>

      {analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                <Lightbulb className="w-5 h-5" />
                <h3 className="text-lg font-bold">Analysis Results</h3>
            </div>
            <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysis}
            </div>
        </div>
      )}
      
      {!analysis && !loading && (
          <div className="text-center py-12 text-gray-400">
              <p>Click the button above to generate insights based on your {transactions.length} recent transactions.</p>
          </div>
      )}
    </div>
  );
};

export default AIInsights;