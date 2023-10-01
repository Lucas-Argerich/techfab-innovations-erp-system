// expected models return types

interface Person {
  id: number
  name: string
  email: string
  phone: string
}

export enum CustomerStatus {
  Active = 'active',
  Archived = 'archived'
}

export interface Customer extends Person {
  status: CustomerStatus
  orders: () => Promise<Order[]>
}

export enum EmployeeStatus {
  Active = 'active',
  Suspended = 'suspended',
  Terminated = 'terminated'
}

export interface Employee extends Person {
  position: string
  status: EmployeeStatus
}

export enum InventoryItemStatus {
  Available = 'available',
  OutOfStock = 'out of stock',
  Discontinued = 'discontinued'
}

export interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
  status: InventoryItemStatus
}

export enum OrderStatus {
  Cancelled = 'cancelled',
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered'
}

export interface Order {
  id: number
  products: Array<{
    quantity: number
    product: () => Promise<InventoryItem>
  }>
  total_price: number
  status: OrderStatus
  customer: () => Promise<Customer>
}

export enum ProductionItemStatus {
  Cancelled = 'cancelled',
  Pending = 'pending',
  InProgress = 'in progress',
  Completed = 'completed'
}

export interface ProductionItem {
  id: number
  quantity: number
  status: ProductionItemStatus
  product: () => Promise<InventoryItem>
}
