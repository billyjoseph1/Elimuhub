import axios from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor to include token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const setAuthToken = (token: string) => {
    if (token) {
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
}

export const clearAuthToken = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    delete api.defaults.headers.common['Authorization']
}

export default api