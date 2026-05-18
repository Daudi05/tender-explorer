import { ApiFetch } from "../api/client"

const API = "/api/v1/bids"

export const getMyBids = async (token) => {
  return await ApiFetch.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}