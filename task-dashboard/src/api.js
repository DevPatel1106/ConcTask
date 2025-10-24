import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = "http://localhost:5000/api"; //backend bsae url

// Base API instance pointing to backend server
const api = axios.create({
  baseURL: API_BASE, // Adjust the baseURL as needed
  headers: { 'Content-Type': 'application/json' },
});

//HTTP API calls
export const getTasks = async () => {
  const res = await api.get('/tasks');
  return res.data;
};

export const addTask = async (task) => {
  const res = await api.post("/tasks", task);
  return res.data;
};

// Websocket client
export const socket = io("http://localhost:5000", {
  transports: ["websocket"], //optional, forces websockets only
}); 

socket.on("connect_err", (err) => {
  console.warn("Sockert connection failed:", err.message);
});

export const getMetrics = async () => {
  const res = await api.get("/metrics");
  return res.data;
};

// Delete a task by ID
// Delete a task by ID, optionally delete recurring series
export const deleteTask = async (taskId, deleteRecurring = false) => {
  try {
    const res = await api.delete(`/tasks/${taskId}`, {
      params: { recurring: deleteRecurring }, // query param for backend
    });
    return res.data; // { message: "Task deleted successfully" }
  } catch (err) {
    console.error("API deleteTask error:", err.response?.data || err.message);
    throw err;
  }
};

export const exportTasks = async (format) => {
  const res = await api.get(`/metrics/export?format=${format}`, {
      responseType: "blob",
    });
  return res;
}


// export default api;