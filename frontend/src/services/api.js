import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

export const studentApi = {
  getAll: () => api.get("/students"),
  create: (payload) => api.post("/students", payload),
  remove: (id) => api.delete(`/students/${id}`),
};

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload),
  login: (payload) => api.post("/auth/login", payload),
};

export const roomApi = {
  getAll: () => api.get("/rooms"),
  create: (payload) => api.post("/rooms", payload),
};

export const wardenApi = {
  getAll: () => api.get("/wardens"),
  create: (payload) => api.post("/wardens", payload),
};

export const allocationApi = {
  getAll: () => api.get("/allocations"),
  create: (payload) => api.post("/allocations", payload),
};

export const healthApi = {
  ping: () => api.get("/health"),
};

export default api;
