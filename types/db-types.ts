export interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

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

export type ProductionItemStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'

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
