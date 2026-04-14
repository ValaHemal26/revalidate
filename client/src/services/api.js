// ============================
// API Service Layer
// ============================
// All API calls go through this file using Axios.
// The token is automatically attached to every request.

import axios from "axios";

// Base URL for the API (uses proxy in development)
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// --- Interceptor ---
// Automatically attach the JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== AUTH ==========
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// ========== BUS ==========
export const getAllBuses = () => API.get("/bus/all");
export const searchBuses = (params) => API.get("/bus/search", { params });
export const getBus = (id) => API.get(`/bus/${id}`);
export const addBus = (data) => API.post("/bus/add", data);
export const getOperatorBuses = () => API.get("/bus/operator/my");
export const updateBus = (id, data) => API.put(`/bus/${id}`, data);
export const deleteBus = (id) => API.delete(`/bus/${id}`);

// ========== BOOKING ==========
export const createBooking = (data) => API.post("/booking/create", data);
export const getMyBookings = () => API.get("/booking/my");
export const getBusBookings = (busId) => API.get(`/booking/bus/${busId}`);
export const cancelBooking = (id) => API.put(`/booking/cancel/${id}`);

// ========== ADMIN ==========
export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");
export const getAdminBuses = () => API.get("/admin/buses");
export const deleteUser = (id) => API.delete(`/admin/user/${id}`);
export const deleteAdminBus = (id) => API.delete(`/admin/bus/${id}`);
