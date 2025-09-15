import { apiRequest } from '@/api/request'

/**
 * Fetch all charge items and drugs that require payment.
 * @returns {Promise<{ data: ChargeItemResponse[], meta?: PaginationMeta }>} The charge items and optional pagination metadata.
 */
export const listChargeItems = (params: {
  type?: string // Type (e.g., ITEM, DRUG)
  keyword?: string // Keyword for searching (e.g., patient name, item name, drug name)
  itemType?: string // Item type (e.g., EXAM, LAB, DISPOSAL)
  drugCategory?: number // Drug category ID
  page?: number // Current page number (starts from 1)
  pageSize?: number // Number of items per page
  sortBy?: string // Field to sort by (e.g., totalAmount, createTime)
  order?: string // Sorting order (asc, desc)
}) =>
  apiRequest<{ data: ChargeItemResponse[]; meta?: PaginationMeta }>({
    url: '/charges/items',
    method: 'get',
    params // Pass the `params` object directly
  })

// Define the ChargeItemResponse type
export interface ChargeItemResponse {
  type: string // Type (e.g., DRUG, ITEM)
  applyId: number // Apply ID
  patientId: number // Patient ID
  patientName: string // Patient Name
  registrationId: number // Registration ID
  itemId: number // Item ID
  itemCode: string // Item Code
  itemName: string // Item Name
  itemType: string | null // Item Type (e.g., EXAM or null)
  drugCategoryId: number | null // Drug Category ID
  price: number // Price per unit
  quantity: number // Quantity
  totalAmount: number // Total amount
  description: string // Description
  createTime: string // Creation time
}

// Define the PaginationMeta type
export interface PaginationMeta {
  page: number // Current page
  size: number // Page size
  total: number // Total items
  totalPages: number // Total pages
}

/**
 * Fetch the list of drug categories.
 * @returns {Promise<DrugCategory[]>} The list of drug categories.
 */
export const listDrugCategories = () =>
  apiRequest<DrugCategory[]>({
    url: '/dictionaries/drug-categories',
    method: 'get'
  })

// Define the DrugCategory type
export interface DrugCategory {
  categoryId: number // Unique identifier for the category
  categoryName: string // Name of the category
  description: string // Description of the category
}

/**
 * Fetch the list of item types.
 * @returns {Promise<ItemType[]>} The list of item types.
 */
export const listItemTypes = () =>
  apiRequest<ItemType[]>({
    url: '/dictionaries/item-types',
    method: 'get'
  })

// Define the ItemType type
export interface ItemType {
  code: string // Unique code for the item type
  name: string // Name of the item type
}

/**
 * Settle charges for the specified items and payment details.
 * @param payload The request payload containing items, paymentMethodId, and settlementTypeId.
 * @returns {Promise<void>} Resolves if the request is successful.
 */
export const settleCharges = (payload: SettleChargeRequest) =>
  apiRequest<void>({
    url: '/charges/settle',
    method: 'post',
    data: payload
  })

export interface ChargeItem {
  type: string // Type of the charge (e.g., ITEM, DRUG)
  applyId: number // Apply ID
  registrationId: number // Registration ID
  itemId: number // Item ID
  patientId: number // Patient ID
  quantity: number // Quantity of the item
  price: number // Price per unit
  totalAmount: number // Total amount for the item
  status: string // Status (e.g., PENDING_PAYMENT)
}

export interface SettleChargeRequest {
  items: ChargeItem[] // Array of charge items
  paymentMethodId: number // Payment method ID
  settlementTypeId: number // Settlement type ID
}
