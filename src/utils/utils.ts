import { readFileSync } from 'node:fs'
import { InventoryItemStatus, OrderStatus, ProductionItemStatus, CustomerStatus, EmployeeStatus } from '../models/types'

export const db = JSON.parse(readFileSync('db/db.json', 'utf-8'))

export const isAnyUndefined = (...values: any[]): boolean =>
  values.some((value) => value === undefined)

export const isValidInventoryStatus = (status: string): status is InventoryItemStatus => {
  return Object.values(InventoryItemStatus).includes(status as InventoryItemStatus)
}

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return Object.values(OrderStatus).includes(status as OrderStatus)
}

export const isValidProductionItemStatus = (status: string): status is ProductionItemStatus => {
  return Object.values(ProductionItemStatus).includes(status as ProductionItemStatus)
}

export const isValidCustomerStatus = (status: string): status is CustomerStatus => {
  return Object.values(CustomerStatus).includes(status as CustomerStatus)
}

export const isValidEmployeeStatus = (status: string): status is EmployeeStatus => {
  return Object.values(EmployeeStatus).includes(status as EmployeeStatus)
}

export const isInInventory = (id: number): boolean => {
  return (id > 0 && id <= db.inventory.length) // Will be done using the model
}

export const areAllInInventory = (ids: number[]): boolean => {
  return ids.every((id) => isInInventory(id))
}

export const isInOrders = (id: number): boolean => {
  return (id > 0 && id <= db.orders.length) // Will be done using the model
}

export const areAllInOrders = (ids: number[]): boolean => {
  return ids.every((id) => isInOrders(id))
}

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone: string) => {
  const phoneRegex1 = /^\d{10}$/ // 10-digit phone number
  const phoneRegex2 = /^\d{3}-\d{3}-\d{4}$/ // XXX-XXX-XXXX format
  const phoneRegex3 = /^\(\d{3}\) \d{3}-\d{4}$/ // (XXX) XXX-XXXX format
  const phoneRegex4 = /^\+\d{1,3} \d{3}-\d{3}-\d{4}$/ // +XXX XXX-XXX-XXXX format
  const phoneRegex5 = /^\d{2} \d{4}-\d{4}$/ // XX XXXX-XXXX format
  const phoneRegex6 = /^\d{2} \d{8}$/ // XX XXXX-XXXX format

  return (
    phoneRegex1.test(phone) ||
    phoneRegex2.test(phone) ||
    phoneRegex3.test(phone) ||
    phoneRegex4.test(phone) ||
    phoneRegex5.test(phone) ||
    phoneRegex6.test(phone)
  )
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const filterReqBody = (obj: Record<string, any>) => {
  const filtered: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key !== 'id' && value !== undefined) {
      filtered[key] = value
    }
  }

  return filtered
}
