import { apiClient } from "@/services/api-client.js"

const requireUserId = (userId) => {
  if (!userId) {
    throw new Error("Se requiere un usuario autenticado para operar el carrito")
  }
  return userId
}

const buildCartPath = (userId, suffix = "") => `/carrito/${userId}${suffix}`

const handleResponse = (response) => response?.data ?? response

export const getCart = async (userId) => {
  requireUserId(userId)
  try {
    const response = await apiClient.private.get(buildCartPath(userId))
    return handleResponse(response)
  } catch (error) {
    console.error("Error obteniendo carrito:", error)
    throw error
  }
}

export const addItem = async (userId, item) => {
  requireUserId(userId)
  try {
    const response = await apiClient.private.post(buildCartPath(userId, "/items"), item)
    return handleResponse(response)
  } catch (error) {
    console.error("Error agregando un item al carrito:", error)
    throw error
  }
}

export const updateItem = async (userId, itemId, quantity) => {
  requireUserId(userId)
  try {
    const response = await apiClient.private.put(
      buildCartPath(userId, `/items/${itemId}`),
      { quantity },
    )
    return handleResponse(response)
  } catch (error) {
    console.error("Error actualizando cantidad del carrito:", error)
    throw error
  }
}

export const removeItem = async (userId, itemId) => {
  requireUserId(userId)
  try {
    const response = await apiClient.private.delete(buildCartPath(userId, `/items/${itemId}`))
    return handleResponse(response)
  } catch (error) {
    console.error("Error eliminando item del carrito:", error)
    throw error
  }
}

export const clearCart = async (userId) => {
  requireUserId(userId)
  try {
    const response = await apiClient.private.delete(buildCartPath(userId))
    return handleResponse(response)
  } catch (error) {
    console.error("Error vaciando carrito:", error)
    throw error
  }
}

export const cartApi = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
}
