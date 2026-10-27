import axios, { AxiosError } from 'axios'
import { refreshTokenCall } from './auth'

const api = axios.create({
    baseURL:"http://localhost:3000/api/v1/"
})

const PUBLIC_ENPOINTS = ["auth/login", "auth/register"]

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("ACCESS_TOKEN")

    const isPublic = PUBLIC_ENPOINTS.some((url) => config.url?.includes(url))
    if(token && !isPublic){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    const isPublic = PUBLIC_ENPOINTS.some((url) => {
      originalRequest.url?.includes(url)
    })

    if (
      error.response?.status === 401 &&
      !originalRequest._isRefresh &&
      !isPublic
    ) {
      originalRequest._isRefresh = true
      try {
        const refreshToken = localStorage.getItem("REFRESH_TOKEN") as string
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        const refreshResponse = await refreshTokenCall(refreshToken)
        const newAccessToken = refreshResponse.data.accessToken

        localStorage.setItem("ACCESS_TOKEN", newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return axios(originalRequest)
      } catch (err) {
        localStorage.removeItem("ACCESS_TOKEN")
        localStorage.removeItem("REFRESH_TOKEN")
        window.location.href = "/login"
        console.error(err)
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api