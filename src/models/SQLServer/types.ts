// mssql database table types

interface StatusTable {
  id: number
  status: string
}

interface Person {
  id: number
  name: string
  email: string
  phone: string
}

export interface CustomersTable extends Person {
  status_id: number
}

export interface CustomersStatusTable extends StatusTable {}

export interface EmployeesTable extends Person {
  position: string
  status_id: number
}

export interface EmployeesStatusTable extends StatusTable {}

export interface InventoryTable {
  id: number
  name: string
  category: string
  quantity: number
  price: number
  status_id: number
}

export interface InventoryStatusTable extends StatusTable {}

export interface OrderProductsTable {
  id: number
  order_id: number
  product_id: number
  quantity: number
}

export interface OrdersTable {
  id: number
  customer_id: number
  total_price: number
  status_id: number
}

export interface OrdersStatusTable extends StatusTable {}

export interface ProductionTable {
  id: number
  product_id: number
  quantity: number
  status_id: number
}

export interface ProductionStatusTable extends StatusTable {}
