import axios from "axios";

const BASE_URL = "https://book-ecommerce-backend-ojha.onrender.com/"; // ✅ updated

const api = axios.create({
  baseURL: BASE_URL
});

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR (AUTO REFRESH)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          `${BASE_URL}/refresh-token`, // ✅ updated
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        console.log("Refresh failed");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;