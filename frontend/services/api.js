import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Residents CRUD
export const getResidents = () => api.get('/residents');
export const createResident = (data) => api.post('/residents', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateResident = (id, data) => api.post(`/residents/${id}?_method=PUT`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteResident = (id) => api.delete(`/residents/${id}`);

// Houses CRUD & Assign
export const getHouses = () => api.get('/houses');
export const createHouse = (data) => api.post('/houses', data);
export const updateHouse = (id, data) => api.put(`/houses/${id}`, data);
export const assignResidentToHouse = (id, data) => api.post(`/houses/${id}/assign`, data);
export const getHouseResidentHistory = (id) => api.get(`/houses/${id}/history`);
export const deleteHouse = (id) => api.delete(`/houses/${id}`);

// Payments API
export const getBillingStatus = (month, year) => api.get(`/billing-status?month=${month}&year=${year}`);
export const createPayment = (data) => api.post('/payments', data);
export const getPayments = () => api.get('/payments');
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// Expenses API
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Dashboard & Reports API
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getDashboardFinanceChart = () => api.get('/dashboard/finance-chart');

export default api;
