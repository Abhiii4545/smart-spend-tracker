import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GeminiService = {
  isAvailable: !!ai,

  async categorizeTransaction(description: string): Promise<{ category: string; type: 'income' | 'expense' }> {
    if (!ai) return { category: 'Other', type: 'expense' };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize this transaction description: "${description}". 
        Return JSON with "category" (one of: Food & Drink, Housing, Transportation, Entertainment, Shopping, Health, Salary, Investment, Utilities, Other) and "type" (income or expense).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['income', 'expense'] }
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
      return { category: 'Other', type: 'expense' };
    } catch (error) {
      console.error("Gemini categorization failed:", error);
      return { category: 'Other', type: 'expense' };
    }
  },

  async analyzeSpending(transactions: Transaction[]): Promise<string> {
    if (!ai) return "AI services are not configured.";
    if (transactions.length === 0) return "No transactions to analyze.";

    const simplified = transactions.slice(0, 50).map(t => `${t.date}: ${t.description} (${t.type}) - $${t.amount} [${t.category}]`).join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these financial transactions and provide a brief, helpful summary of spending habits and 2 actionable tips to save money. Keep it under 150 words.\n\n${simplified}`,
      });
      return response.text || "Could not generate insights.";
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return "Error generating insights. Please try again later.";
    }
  },

  async parseNaturalLanguage(input: string): Promise<Partial<Transaction> | null> {
    if (!ai) return null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Parse this financial text into a transaction object: "${input}".
        Return JSON with fields: amount (number), description (string), category (string), type (income/expense), date (ISO string YYYY-MM-DD). Use today's date if not specified.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['income', 'expense'] },
                date: { type: Type.STRING }
              }
            }
        }
      });
      
      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("Gemini parsing failed:", error);
      return null;
    }
  }
};
