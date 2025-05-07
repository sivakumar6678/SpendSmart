import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [paymentMethodAnalysis, setPaymentMethodAnalysis] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const token = localStorage.getItem('token');

  // Fetch user data
  const fetchUserData = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/user-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  // Fetch income and expense data
  const fetchFinancialData = async () => {
    if (!token) return;
    
    try {
      // Fetch income data
      const incomeResponse = await fetch('http://127.0.0.1:5000/api/get-user-income', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const income = await incomeResponse.json();
      setIncomeData(income);
      
      // Fetch expense data
      const expenseResponse = await fetch('http://127.0.0.1:5000/api/get-user-expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const expense = await expenseResponse.json();
      setExpenseData(expense);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data');
    }
  };

  // Fetch budgets
  const fetchBudgets = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/budgets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      const data = await response.json();
      setBudgets(data.budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Fetch saving goals
  const fetchSavingGoals = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/saving-goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch saving goals');
      }
      
      const data = await response.json();
      setSavingGoals(data.saving_goals);
    } catch (error) {
      console.error('Error fetching saving goals:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      
      // Count unread notifications
      const unread = data.notifications.filter(notification => !notification.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/achievements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      
      const data = await response.json();
      setAchievements(data.achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch financial insights
  const fetchInsights = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/financial-insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  // Fetch payment method analysis
  const fetchPaymentMethodAnalysis = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/payment-method-analysis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment method analysis');
      }
      
      const data = await response.json();
      setPaymentMethodAnalysis(data.payment_method_analysis);
    } catch (error) {
      console.error('Error fetching payment method analysis:', error);
    }
  };

  // Fetch budget analysis
  const fetchBudgetAnalysis = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/budget-analysis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch budget analysis');
      }
      
      const data = await response.json();
      setBudgetAnalysis(data.budget_analysis);
    } catch (error) {
      console.error('Error fetching budget analysis:', error);
    }
  };

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds = []) => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_ids: notificationIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      
      // Update notifications in state
      if (notificationIds.length > 0) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notificationIds.includes(notification.id) 
              ? { ...notification, read: true } 
              : notification
          )
        );
      } else {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
      }
      
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Add a new budget
  const addBudget = async (budgetData) => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budgetData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add budget');
      }
      
      const newBudget = await response.json();
      setBudgets(prevBudgets => [...prevBudgets, newBudget]);
      
      // Refresh budget analysis
      fetchBudgetAnalysis();
      
      return newBudget;
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  };

  // Update a budget
  const updateBudget = async (budgetId, budgetData) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budgetData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update budget');
      }
      
      const updatedBudget = await response.json();
      setBudgets(prevBudgets => 
        prevBudgets.map(budget => 
          budget.id === budgetId ? updatedBudget : budget
        )
      );
      
      // Refresh budget analysis
      fetchBudgetAnalysis();
      
      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  // Delete a budget
  const deleteBudget = async (budgetId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
      
      setBudgets(prevBudgets => 
        prevBudgets.filter(budget => budget.id !== budgetId)
      );
      
      // Refresh budget analysis
      fetchBudgetAnalysis();
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  // Add a new saving goal
  const addSavingGoal = async (goalData) => {
    if (!token) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/saving-goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add saving goal');
      }
      
      const newGoal = await response.json();
      setSavingGoals(prevGoals => [...prevGoals, newGoal]);
      
      return newGoal;
    } catch (error) {
      console.error('Error adding saving goal:', error);
      throw error;
    }
  };

  // Update a saving goal
  const updateSavingGoal = async (goalId, goalData) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/saving-goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update saving goal');
      }
      
      const updatedGoal = await response.json();
      setSavingGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        )
      );
      
      return updatedGoal;
    } catch (error) {
      console.error('Error updating saving goal:', error);
      throw error;
    }
  };

  // Delete a saving goal
  const deleteSavingGoal = async (goalId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/saving-goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete saving goal');
      }
      
      setSavingGoals(prevGoals => 
        prevGoals.filter(goal => goal.id !== goalId)
      );
    } catch (error) {
      console.error('Error deleting saving goal:', error);
      throw error;
    }
  };

  // Update a transaction
  const updateTransaction = async (transactionId, transactionData) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }
      
      const updatedTransaction = await response.json();
      
      // Refresh expense data
      fetchFinancialData();
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  // Delete a transaction
  const deleteTransaction = async (transactionId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      
      // Refresh expense data
      fetchFinancialData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  // Update an income
  const updateIncome = async (incomeId, incomeData) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/incomes/${incomeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incomeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income');
      }
      
      const updatedIncome = await response.json();
      
      // Refresh income data
      fetchFinancialData();
      
      return updatedIncome;
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  };

  // Delete an income
  const deleteIncome = async (incomeId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/incomes/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income');
      }
      
      // Refresh income data
      fetchFinancialData();
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  };

  // Filter transactions
  const filterTransactions = async (filters) => {
    if (!token) return;
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`http://127.0.0.1:5000/api/transactions/filter?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter transactions');
      }
      
      const data = await response.json();
      return data.transactions;
    } catch (error) {
      console.error('Error filtering transactions:', error);
      throw error;
    }
  };

  // Filter incomes
  const filterIncomes = async (filters) => {
    if (!token) return;
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`http://127.0.0.1:5000/api/incomes/filter?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter incomes');
      }
      
      const data = await response.json();
      return data.incomes;
    } catch (error) {
      console.error('Error filtering incomes:', error);
      throw error;
    }
  };

  // Load all data on initial render
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchFinancialData(),
          fetchBudgets(),
          fetchSavingGoals(),
          fetchNotifications(),
          fetchAchievements(),
          fetchInsights(),
          fetchPaymentMethodAnalysis(),
          fetchBudgetAnalysis()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Refresh notifications every minute
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [token]);

  const value = {
    userData,
    incomeData,
    expenseData,
    budgets,
    savingGoals,
    notifications,
    achievements,
    insights,
    paymentMethodAnalysis,
    budgetAnalysis,
    unreadNotifications,
    loading,
    error,
    fetchUserData,
    fetchFinancialData,
    fetchBudgets,
    fetchSavingGoals,
    fetchNotifications,
    fetchAchievements,
    fetchInsights,
    fetchPaymentMethodAnalysis,
    fetchBudgetAnalysis,
    markNotificationsAsRead,
    addBudget,
    updateBudget,
    deleteBudget,
    addSavingGoal,
    updateSavingGoal,
    deleteSavingGoal,
    updateTransaction,
    deleteTransaction,
    updateIncome,
    deleteIncome,
    filterTransactions,
    filterIncomes
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;