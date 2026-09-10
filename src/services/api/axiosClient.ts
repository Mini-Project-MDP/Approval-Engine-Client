import axios from 'axios'

// In dev, Vite proxies /api to the Go service (see vite.config.ts).
// In prod, set VITE_API_BASE_URL to the deployed service URL.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)
