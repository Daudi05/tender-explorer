import { apiFetch } from '../api/client'

/**
 * Get current contractor's bids
 */
export async function getMyBids() {
  return await apiFetch('/bids/me')
}

/**
 * Get bids for a specific tender
 * @param {string|number} tenderId
 */
export async function getTenderBids(tenderId) {
  return await apiFetch(`/bids/tender/${tenderId}`)
}

/**
 * Get flagged bids (Admin)
 */
export async function getFlaggedBids() {
  return await apiFetch('/bids/flagged')
}

/**
 * Create a new bid
 * @param {Object} bidData
 */
export async function createBid(bidData) {
  return await apiFetch('/bids', {
    method: 'POST',
    body: JSON.stringify(bidData),
  })
}

/**
 * Update an existing bid
 * @param {string|number} bidId
 * @param {Object} bidData
 */
export async function updateBid(bidId, bidData) {
  return await apiFetch(`/bids/${bidId}`, {
    method: 'PATCH',
    body: JSON.stringify(bidData),
  })
}

/**
 * Delete a bid
 * @param {string|number} bidId
 */
export async function deleteBid(bidId) {
  return await apiFetch(`/bids/${bidId}`, {
    method: 'DELETE',
  })
}