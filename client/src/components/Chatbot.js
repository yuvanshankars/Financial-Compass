import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import { getTransactions, createTransaction } from '../services/transactionService';
import { getCategories, createCategory } from '../services/categoryService';
import { getMonthlySummary } from '../services/reportService';


const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const fetchAndProcessTransactions = async () => {
    try {
      setLoading(true);
      console.log('Fetching transactions...');
      const data = await getTransactions();
      console.log('Received data:', data);
      let transactionsData = [];
      if (data && data.data && Array.isArray(data.data.transactions)) {
        transactionsData = data.data.transactions;
        console.log('Found transactions in data.data.transactions');
      } else if (data && Array.isArray(data.transactions)) {
        transactionsData = data.transactions;
        console.log('Found transactions in data.transactions');
      } else if (data && Array.isArray(data.data)) {
        transactionsData = data.data;
        console.log('Found transactions in data.data');
      } else if (Array.isArray(data)) {
        transactionsData = data;
        console.log('Found transactions in data root');
      } else {
        console.log('Could not find transactions array in the response', data);
      }
      console.log('Parsed transactions:', transactionsData);

      if (Array.isArray(transactionsData)) {
        let totalIncome = 0;
        let totalExpenses = 0;
        transactionsData.forEach(t => {
          if (t.type === 'income') {
            totalIncome += t.amount;
          } else {
            totalExpenses += t.amount;
          }
        });
        console.log('Calculated income:', totalIncome);
        console.log('Calculated expenses:', totalExpenses);
        setIncome(totalIncome);
        setExpenses(totalExpenses);
      } else {
        console.log('transactionsData is not an array:', transactionsData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't connect to the database.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAndProcessTransactions();
      try {
        const categoriesData = await getCategories();
        if (categoriesData && categoriesData.data) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSend = async () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: 'user' };
      let botResponse;

      const lowerCaseInput = input.toLowerCase();
      const words = lowerCaseInput.split(' ');

      if (words.includes('add') && (words.includes('income') || words.includes('expense'))) {
        const type = words.includes('income') ? 'income' : 'expense';
        const amount = parseInt(words.find(w => !isNaN(parseInt(w, 10))), 10);
        const description = "Transaction added by chatbot";

        if (!isNaN(amount)) {
          try {
            let category = categories.find(c => c.name === 'Uncategorized');
            if (!category) {
              const newCategory = await createCategory({ name: 'Uncategorized', color: '#808080', icon: 'fas fa-question-circle' });
              if (newCategory && newCategory.data) {
                setCategories([...categories, newCategory.data]);
                category = newCategory.data;
              } else {
                throw new Error('Could not create default category.');
              }
            }
            await createTransaction({ type, amount, description, category: category._id, date: new Date() });
            botResponse = { text: `I've added ${amount} to your ${type}.`, sender: 'bot' };
            await fetchAndProcessTransactions();
          } catch (error) {
            console.error("Error adding transaction:", error);
            botResponse = { text: `Sorry, I couldn't add the transaction.`, sender: 'bot' };
          }
        } else {
          botResponse = { text: "I couldn't understand the amount. Please use a number.", sender: 'bot' };
        }
      } else if (words.includes('spend') && words.includes('for')) {
        const type = 'expense';
        const amount = parseInt(words.find(w => !isNaN(parseInt(w, 10))), 10);
        const forIndex = words.indexOf('for');
        const categoryName = words.slice(forIndex + 1).join(' ');
        const description = `Transaction added by chatbot: ${input}`;

        if (!isNaN(amount) && categoryName) {
            try {
                let category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
                if (!category) {
                    const newCategory = await createCategory({ name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1), color: '#808080', icon: 'fas fa-question-circle' });
                    if (newCategory && newCategory.data) {
                        setCategories([...categories, newCategory.data]);
                        category = newCategory.data;
                    } else {
                        throw new Error(`Could not create category ${categoryName}.`);
                    }
                }
                await createTransaction({ type, amount, description, category: category._id, date: new Date() });
                botResponse = { text: `I've added ${amount} for ${category.name}.`, sender: 'bot' };
                await fetchAndProcessTransactions();
            } catch (error) {
                console.error("Error adding transaction:", error);
                botResponse = { text: `Sorry, I couldn't add the transaction.`, sender: 'bot' };
            }
        } else if (isNaN(amount)) {
            botResponse = { text: "I couldn't understand the amount. Please use a number.", sender: 'bot' };
        } else {
            botResponse = { text: "I couldn't understand the category for your expense.", sender: 'bot' };
        }
      }
      else if (lowerCaseInput.includes('report')) {
        try {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const summary = await getMonthlySummary(year, month);
          if (summary && summary.success) {
            const { totalIncome, totalExpense, balance } = summary.data;
            botResponse = { text: `Here's your summary for this month: Total Income: ${totalIncome}, Total Expenses: ${totalExpense}, Balance: ${balance}.`, sender: 'bot' };
          } else {
            botResponse = { text: "Sorry, I couldn't fetch the report.", sender: 'bot' };
          }
        } catch (error) {
          console.error("Error fetching report:", error);
          botResponse = { text: "Sorry, I couldn't fetch the report.", sender: 'bot' };
        }
      } else if (lowerCaseInput.includes('income')) {
        const balance = income - expenses;
        botResponse = { text: `Your total income is ${income}, total expenses are ${expenses}, and your balance is ${balance}.`, sender: 'bot' };
      } else if (lowerCaseInput.includes('expense')) {
        const balance = income - expenses;
        botResponse = { text: `Your total expenses are ${expenses}, total income is ${income}, and your balance is ${balance}.`, sender: 'bot' };
      }
      else {
        botResponse = { text: `I can tell you about your income and expenses.`, sender: 'bot' };
      }

      setMessages([...messages, newMessage, botResponse]);
      setInput('');
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;