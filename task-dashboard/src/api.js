import axios from 'axios';

// Base API instance pointing to backend server
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust the baseURL as needed
});

export default api;