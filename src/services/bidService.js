import axios from "axios"

const API = "http://127.0.0.1:5000/api/bids"

export const getMyBids = async (token) => {
  return await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}