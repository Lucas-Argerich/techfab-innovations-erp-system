// expected models return types

export type Models = 'customer' | 'employee' | 'inventoryItem' | 'order' | 'productionItem'

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
  orders: Order[]
}

export interface InputCustomer extends Omit<Customer, 'id' | 'orders'> { }

export enum EmployeeStatus {
  Active = 'active',
  Suspended = 'suspended',
  Terminated = 'terminated'
}

export interface Employee extends Person {
  position: string
  status: EmployeeStatus
}

export interface InputEmployee extends Omit<Employee, 'id'> { }

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

export interface InputInventoryItem extends Omit<InventoryItem, 'id'> { }

export enum OrderStatus {
  Cancelled = 'cancelled',
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered'
}

export interface OrderItem {
  id: number
  quantity: number
  product: InventoryItem
}

export interface InputOrderItem extends Omit<OrderItem, 'id' | 'product'> {
  product_id: number
}

export interface Order {
  id: number
  items: OrderItem[]
  total_price: number
  status: OrderStatus
  customer_id: number
}

export interface InputOrder extends Omit<Order, 'id' | 'items'> { }

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
  product: InventoryItem
}

export interface InputProductionItem extends Omit<ProductionItem, 'id' | 'product'> {
  product_id: number
}
