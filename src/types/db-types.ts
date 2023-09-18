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
  customer_id: number
  products: Array<{
    product_id: number
    quantity: number
  }>
  total_price: number
  status: string
}

export enum ProductionItemStatus {
  Cancelled = 'cancelled',
  Pending = 'pending',
  InProgress = 'in progress',
  Completed = 'completed'
}

export interface ProductionItem {
  id: number
  product_id: number
  quantity: number
  status: ProductionItemStatus
}

interface Person {
  id: number
  name: string
  email: string
  phone: string
}

export interface Customer extends Person {
  order_ids: number[]
}

export interface Employee extends Person {
  position: string
}

export interface Database {
  inventory: InventoryItem[]
  orders: Order[]
  production: ProductionItem[]
  customers: Customer[]
  employees: Employee[]
}
