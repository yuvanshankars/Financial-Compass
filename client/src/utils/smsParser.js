export const parseSms = (smsText) => {
  const smsLines = smsText.split('\n').filter(line => line.trim() !== '');
  const transactions = [];

  const patterns = [
    // Expenses
    { regex: /(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*debited from.*\s*on\s*(\d{2}-\w{3}-\d{4})/i, type: 'expense', merchantIndex: 2, dateIndex: 2 },
    { regex: /Rs\.?\s*([\d,]+\.?\d*)\s*debited on Card.*?at\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /INR\s*([\d,]+\.?\d*)\s*Debited on.*?at\s+(.*?)\./i, type: 'expense', merchantIndex: 2 },
    { regex: /payment of\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*made.*?on\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /paid\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*to\s+(.*?)(?:\s+via|\s+on|$)/i, type: 'expense', merchantIndex: 2 },
    { regex: /sent\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*to\s+(.*?)(?:\s+using|\s+on|$)/i, type: 'expense', merchantIndex: 2 },
    { regex: /spent\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*at\s+(.*?)(?:\s+via|\s+on|$)/i, type: 'expense', merchantIndex: 2 },
    { regex: /withdrawal of\s*(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*from\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*withdrawn at\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /auto-debit of\s*(?:₹|Rs|INR)\.?[\s]*([\d,]+\.?\d*)\s*for\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /recurring payment of\s*(?:₹|Rs|INR)\.?[\s]*([\d,]+\.?\d*)\s*debited on .*? to\s+(.*?)\./i, type: 'expense', merchantIndex: 2 },
    { regex: /(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*charged monthly/i, type: 'expense', merchant: 'Subscription' },
    { regex: /(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*billed on/i, type: 'expense', merchant: 'Online Purchase' },
    { regex: /(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*recharge successful/i, type: 'expense', merchant: 'Recharge' },
    { regex: /(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*debited for\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /amount of\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*debited for\s+(.*?)\s+on/i, type: 'expense', merchantIndex: 2 },
    { regex: /amount of ([\d,]+\.?\d*)\s*has been DEBITED to your account/i, type: 'expense', merchant: 'Unknown' },
    { regex: /(?:Canara Bank:)?\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*paid thru.*?to\s+(.*?)(?:, |\.|$)/i, type: 'expense', merchantIndex: 2 },

    // Incomes
    { regex: /credited with\s*(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)/i, type: 'income', merchant: 'Refund' },
    { regex: /refund of\s*(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*processed/i, type: 'income', merchant: 'Refund' },
    { regex: /(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*credited to/i, type: 'income', merchant: 'Deposit' },
    { regex: /(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*received from\s+(.*?)(?:\s+via|\s+on|$)/i, type: 'income', merchantIndex: 2 },
    { regex: /you have received\s*(?:Rs|INR|₹)\.?[\s]*([\d,]+\.?\d*)\s*from\s+(.*?)(?:\s+on|$)/i, type: 'income', merchantIndex: 2 },
    { regex: /you received\s*(?:₹|Rs|INR)\.?[\s]*([\d,]+\.?\d*)\s*from\s+(.*?)(?:\s+on|$)/i, type: 'income', merchantIndex: 2 },
    { regex: /cashback of\s*(?:₹|Rs|INR)\.?[\s]*([\d,]+\.?\d*)\s*credited/i, type: 'income', merchant: 'Cashback' },
    { regex: /NEFT credit of\s*(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*from\s+(.*?)\s+on/i, type: 'income', merchantIndex: 2 },
    { regex: /credit of\s*(?:INR|Rs|₹)\.?[\s]*([\d,]+\.?\d*)\s*in A\/c/i, type: 'income', merchant: 'Salary' },
    { regex: /amount of ([\d,]+\.?\d*)\s*has been CREDITED to your account on (\d{4}-\d{2}-\d{2}).*?towards interest/i, type: 'income', merchant: 'Interest', dateIndex: 2 },
  ];

  smsLines.forEach(line => {
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        const description = pattern.merchantIndex && match[pattern.merchantIndex] ? match[pattern.merchantIndex].trim() : pattern.merchant || 'Unknown';
        
        let date = new Date(); // Default to now
        if (pattern.dateIndex && match[pattern.dateIndex]) {
            const dateStr = match[pattern.dateIndex].replace(/\./g, '-');
            const parsedDate = new Date(dateStr);
            date = new Date(parsedDate.getTime() + Math.abs(parsedDate.getTimezoneOffset() * 60000));
        } else {
            // Fallback to generic date parsing if no dateIndex or match
            const dateMatch = line.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{2}-[A-Za-z]{3}-\d{4})/);
            if (dateMatch) {
                const dateStr = dateMatch[0].replace(/\./g, '-');
                const parsedDate = new Date(dateStr);
                date = new Date(parsedDate.getTime() + Math.abs(parsedDate.getTimezoneOffset() * 60000));
            }
        }

        transactions.push({
          date: date.toISOString().split('T')[0],
          description,
          amount,
          type: pattern.type,
          category: null, // Default category
          id: Date.now() + Math.random(), // unique id for key prop
          selected: true, // Default to selected
        });
        // Move to next line once a pattern is matched
        return; 
      }
    }
  });

  return transactions;
};