// src/services/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// ─── 攔截器：統一錯誤處理 ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 錯誤：", error.message);
    return Promise.reject(error);
  }
);

// ─── 健康檢查 ──────────────────────────────────────────────────────────────────
export const healthCheck = () => api.get("/health");

// ─── 病害資料 ──────────────────────────────────────────────────────────────────
export const getDiseases = () => api.get("/diseases");

export const getDiseaseById = (id) => api.get(`/diseases/${id}`);

// ─── 系統統計 ──────────────────────────────────────────────────────────────────
export const getStats = () => api.get("/stats");

// ─── 圖片辨識（支援 File 物件 或 base64 字串）────────────────────────────────
export const predictDisease = (imageData) => {
  if (imageData instanceof File) {
    const formData = new FormData();
    formData.append("image", imageData);
    return api.post("/predict", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // base64 字串
  return api.post("/predict", { image_data: imageData });
};

export default api;