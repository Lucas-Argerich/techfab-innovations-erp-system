import { readFileSync } from 'node:fs'
import { InventoryItemStatus, type Database, OrderStatus, ProductionItemStatus, CustomerStatus, EmployeeStatus } from '../types/db-types'

export const db = JSON.parse(readFileSync('db/db.json', 'utf-8')) as Database

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
  return (id > 0 && id <= db.inventory.length)
}
