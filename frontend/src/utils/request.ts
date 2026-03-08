import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define the standard API response structure
export interface ApiResponse<T = any> {
  returnCode: string;
  errorMsg: string;
  body: T;
}

// Create axios instance
const service: AxiosInstance = axios.create({
  baseURL: '/', // Use relative path as proxy is configured in Vite
  timeout: 10000,
});

// Request interceptor
service.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    
    // Check returnCode
    if (res.returnCode === 'SUC0000') {
      // Return the body directly to keep compatibility with existing code
      // that expects the data directly.
      // Note: We modify the return type of the promise to be T (the body) 
      // instead of ApiResponse<T> to minimize refactoring in api/procurement.ts
      return res.body; 
    } else {
      // Handle error
      const errorMsg = res.errorMsg || 'Error';
      console.error('API Error:', errorMsg);
      // You might want to show a toast/message here
      return Promise.reject(new Error(errorMsg));
    }
  },
  (error) => {
    console.error('Network Error:', error);
    return Promise.reject(error);
  }
);

export default service;
