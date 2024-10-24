// axios.js
import axios from 'axios';
import { createBrowserHistory } from 'history';

// Create a history object to manage navigation outside React components
const history = createBrowserHistory();

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed() {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
}

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,  // Include cookies with requests
});

// Define authentication-related endpoints to exclude from interception
const authEndpoints = ['token/', 'token/refresh/'];

// Request interceptor to include CSRF token if needed
axiosInstance.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
});

// Response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        const { config, response } = error;
        const originalRequest = config;

        // Define authentication-related endpoints to exclude from interception
        const authEndpoints = ['token/', 'token/refresh/', 'signup/', 'verify-email/'];

        // Check if the request URL includes any of the auth endpoints
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url.includes(endpoint));

        if (response && response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // Queue the request until the token is refreshed
                return new Promise((resolve, reject) => {
                    addRefreshSubscriber(() => resolve(axiosInstance(originalRequest)));
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                await axiosInstance.post('token/refresh/');
                isRefreshing = false;
                onRefreshed();
                return axiosInstance(originalRequest);
            } catch (err) {
                isRefreshing = false;
                console.error('Token refresh failed:', err);
                // Redirect to login page
                history.push('/login');
                window.location.href = '/login'; // Fallback for navigation
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;