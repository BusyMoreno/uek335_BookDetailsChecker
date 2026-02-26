import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: "http://10.0.2.2:3030",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Fehler beim Laden des Tokens:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);