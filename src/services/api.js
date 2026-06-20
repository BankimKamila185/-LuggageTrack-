import axios from "axios";

// Custom Axios instance
const api = axios.create({
  baseURL: "/api"
});

// Automatically add the Authorization header if JWT token is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("luggagetrack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // --- AUTHENTICATION ---
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    const { token, user } = response.data;
    localStorage.setItem("luggagetrack_user", JSON.stringify(user));
    localStorage.setItem("luggagetrack_token", token);
    return response;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout request failed:", err.message);
    }
    localStorage.removeItem("luggagetrack_user");
    localStorage.removeItem("luggagetrack_token");
    return { data: { success: true } };
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("luggagetrack_user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("luggagetrack_token");
  },

  // --- BAGGAGE ---
  getBaggage: async () => {
    return await api.get("/baggage");
  },

  getBaggageById: async (id) => {
    return await api.get(`/baggage/${id}`);
  },

  trackBaggage: async (query) => {
    return await api.get("/baggage/track", { params: { q: query } });
  },

  addBaggage: async (bag) => {
    return await api.post("/baggage", bag);
  },

  updateBaggage: async (id, updatedBag) => {
    return await api.put(`/baggage/${id}`, updatedBag);
  },

  updateBaggageStatus: async (id, newStatus) => {
    return await api.put(`/baggage/${id}`, { status: newStatus });
  },

  deleteBaggage: async (id) => {
    return await api.delete(`/baggage/${id}`);
  },

  // --- USERS ---
  getUsers: async () => {
    return await api.get("/users");
  },

  addUser: async (user) => {
    return await api.post("/users", user);
  },

  updateUser: async (id, updatedUser) => {
    return await api.put(`/users/${id}`, updatedUser);
  },

  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },

  // --- INFRASTRUCTURE & HEALTH ---
  getHealth: async () => {
    return await api.get("/health");
  },

  getNotifications: async () => {
    return await api.get("/notifications");
  },

  getRecentActivity: async () => {
    return await api.get("/activity");
  },

  // --- LOST REPORTS ---
  getLostReports: async () => {
    return await api.get("/lost-reports");
  },

  addLostReport: async (report) => {
    return await api.post("/lost-reports", report);
  },

  updateLostReport: async (id, updatedFields) => {
    return await api.put(`/lost-reports/${id}`, updatedFields);
  },

  // --- SIMULATOR CONFIG ---
  getSimulatorConfig: async () => {
    return await api.get("/simulator/config");
  },

  updateSimulatorConfig: async (config) => {
    return await api.post("/simulator/config", config);
  }
};

export default api;
