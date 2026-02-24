 import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: '/api',
});

// Attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle Errors Globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong!';
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            toast.error('Session expired. Please login again.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } else {
            // Display error toast for all other errors
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default api;