import api from "./api"

export const getAllArticles = async (page: number, limit: number) => {
  const res = await api.get(`/article/?page=${page}&limit=${limit}`)
  return res.data
}

export const createArticle = async (data: FormData) => {
  const res = await api.post("/article/create", data, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const createARticle = createArticle