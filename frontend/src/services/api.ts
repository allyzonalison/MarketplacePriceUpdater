import axios from "axios";

const api = axios.create({
  baseURL: "https://marketplacepriceupdater.onrender.com",
  timeout: 120000, // 2 minutes
});

export default api;
