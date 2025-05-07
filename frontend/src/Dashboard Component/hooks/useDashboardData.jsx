import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch all dashboard data
 * @returns {Object} User data, income data, expense data, and loading state
 */
const useDashboardData = () => {
  const [userData, setUserData] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found. Please log in.");
      setError("No token found. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/user-data', {
        method: 'GET',
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
      console.error('Error fetching user data ', error);
      setError('Failed to load user data. Please try again later.');
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found. Please log in.");
      setError("No token found. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch income data
      const incomeResponse = await fetch('http://127.0.0.1:5000/api/get-user-income', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const income = await incomeResponse.json();

      // Fetch expense data
      const expenseResponse = await fetch('http://127.0.0.1:5000/api/get-user-expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const expense = await expenseResponse.json();

      setIncomeData(income);
      setExpenseData(expense);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data after profile edit
  const updateUserData = (newUserData) => {
    setUserData(newUserData);
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchUserData(), fetchDashboardData()])
      .catch(error => {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return {
    userData,
    incomeData,
    expenseData,
    isLoading,
    error,
    updateUserData,
    refreshData: () => {
      setIsLoading(true);
      Promise.all([fetchUserData(), fetchDashboardData()])
        .finally(() => setIsLoading(false));
    }
  };
};

export default useDashboardData;