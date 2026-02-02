const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// Initialize Gemini
// Note: User needs to set GEMINI_API_KEY in .env
// Initialize Gemini
// Note: User needs to set GEMINI_API_KEY in .env
const apiKey = 'AIzaSyBxLxglzlGFjB0__Kx0bcoKKX71_PQ27Os';
const genAI = new GoogleGenerativeAI(apiKey);

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            return res.status(400).json({
                success: false,
                message: "AI configuration missing. Please set GEMINI_API_KEY in server .env file."
            });
        }

        // 1. Fetch Context Data
        // Get Categories
        const categories = await Category.find({ user: userId });
        const categoryNames = categories.map(c => c.name).join(', ');

        // Get Recent Transactions (last 20 for context)
        const transactions = await Transaction.find({ user: userId })
            .sort({ date: -1 })
            .limit(20);

        // Calculate simple stats for context
        const stats = await Transaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }
            }
        ]);

        const currentStats = stats.length > 0 ? stats[0] : { totalIncome: 0, totalExpense: 0 };
        const balance = currentStats.totalIncome - currentStats.totalExpense;

        // 2. Construct System Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are a smart financial assistant for a personal expense tracker app.
      
      Current User Context:
      - Valid Categories: ${categoryNames}
      - Current Balance: ₹${balance}
      - Total Income: ₹${currentStats.totalIncome}
      - Total Expenses: ₹${currentStats.totalExpense}
      - Recent Transactions: ${JSON.stringify(transactions.map(t => ({
            date: t.date.toISOString().split('T')[0],
            title: t.title,
            amount: t.amount,
            type: t.type,
            category: t.category
        })))}
      - Current Date: ${new Date().toISOString().split('T')[0]}

      User Message: "${message}"

      Instructions:
      1. Analyze the user's message.
      2. If the user wants to ADD/CREATE a transaction (e.g., "Spent 500 on food", "Add income 20000"), extract the details and return a JSON object with "action": "create". Infer the specific category from the user's input matching the valid categories list if possible, otherwise use 'Other'.
      3. If the user is asking a QUESTION about their finances (e.g., "How much did I spend on food?", "What is my balance?"), answer it based on the provided context and return "action": "none".
      4. Always format amounts in Indian Rupees (₹).
      
      Output Format (JSON ONLY):
      
      Option 1 (Action - Add Transaction):
      {
        "action": "create",
        "data": {
          "title": "String (short description)",
          "amount": Number,
          "type": "income" or "expense",
          "category": "String (must be one of: ${categoryNames} or 'Other')",
          "date": "YYYY-MM-DD" (default to today if not specified)
        },
        "response_text": "I have added..."
      }

      Option 2 (No Action - Answer Question):
      {
        "action": "none",
        "response_text": "Your answer here..."
      }
    `;

        // 3. Call AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse Response
        // Clean up markdown code blocks if present
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let aiResponse;
        try {
            aiResponse = JSON.parse(cleanJson);
        } catch (e) {
            console.error("AI JSON Parse Error", e);
            // Fallback if AI didn't return valid JSON
            return res.json({ success: true, message: text, action: 'none' });
        }

        // 5. Execute Action if needed
        if (aiResponse.action === 'create' && aiResponse.data) {
            try {
                const newTransaction = await Transaction.create({
                    user: userId,
                    title: aiResponse.data.title,
                    amount: aiResponse.data.amount,
                    type: aiResponse.data.type,
                    category: aiResponse.data.category,
                    date: new Date(aiResponse.data.date),
                    notes: 'Created via AI Assistant'
                });
                // Update the response text to confirm success with ID if needed, but the text from AI is usually good enough.
                // We return the created transaction so frontend can update.
                return res.json({
                    success: true,
                    message: aiResponse.response_text,
                    action: 'create',
                    transaction: newTransaction
                });
            } catch (dbError) {
                console.error("DB Create Error", dbError);
                return res.json({
                    success: false,
                    message: "I understood you wanted to add a transaction, but I encountered a database error."
                });
            }
        }

        // default return for questions
        res.json({
            success: true,
            message: aiResponse.response_text,
            action: 'none'
        });

    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({ success: false, message: 'AI Service currently unavailable.' });
    }
};
