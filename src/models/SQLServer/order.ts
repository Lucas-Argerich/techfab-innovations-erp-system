import sql from 'mssql'
import mssqlConfig from '../../constants/mssqlConfig'
import {
  type OrdersStatusTable,
  type OrderItemsTable,
  type OrdersTable
} from './types'
import { type OrderItem, type Order, type OrderStatus, type InputOrder, type InputOrderItem } from '../types'
import inventoryItemModel from './inventoryItem'
import { ItemNotFound, StatusNotFound } from '../../constants/errors'
import customerModel from './customer'

const connection = sql.connect(mssqlConfig)

class orderModel {
  private static async ordersTableToOrder (rawOrder: OrdersTable): Promise<Order> {
    const {
      id,
      customer_id: customerId,
      total_price: totalPrice,
      status_id: statusId
    } = rawOrder

    const items = await orderModel.readAllOrderItems(id)

    const status = await orderModel.readStatus(statusId)

    return { id, items, total_price: totalPrice, status, customer_id: customerId }
  }

  private static async orderItemsTableToOrderItem (rawOrderProduct: OrderItemsTable): Promise<OrderItem> {
    const { id, quantity, product_id: productId } = rawOrderProduct

    const product = await inventoryItemModel.read(productId)

    return { id, quantity, product }
  }

  private static async readStatus (statusId: number): Promise<OrderStatus> {
    const statusQuery = await (
      await connection
    ).query<OrdersStatusTable>`SELECT * FROM OrdersStatus WHERE id = ${statusId}`

    const status = statusQuery.recordset[0].status as OrderStatus

    return status
  }

  private static async rawOrder (id: number) {
    const orderQuery = await (await connection).query<OrdersTable>`SELECT * FROM Orders WHERE id = ${id}`
    const rawOrder = orderQuery.recordset[0]

    if (rawOrder === undefined) {
      throw new ItemNotFound(id, { typeName: 'order', method: 'read' })
    }

    return rawOrder
  }

  private static async readStatusId (status: string): Promise<number> {
    const statusQuery = await (await connection).query<OrdersStatusTable>`SELECT id FROM OrdersStatus WHERE status = ${status}`
    const rawStatus = statusQuery.recordset[0]

    if (rawStatus === undefined) {
      throw new StatusNotFound(status, { typeName: 'order', method: 'read' })
    }

    const statusId = rawStatus.id

    return statusId
  }

  static async readAll (): Promise<Order[]> {
    const selectAllQuery = await (await connection).query<OrdersTable>`SELECT * FROM Orders`

    const orders = await Promise.all(selectAllQuery.recordset.map(this.ordersTableToOrder))

    return orders
  }

  static async readAllOrderItems (orderId: number): Promise<OrderItem[]> {
    await this.rawOrder(orderId)

    const orderItemsQuery = await (
      await connection
    )
      .query<OrderItemsTable>`SELECT * FROM OrderItems WHERE order_id = ${orderId}`

    const orderItems = await Promise.all(orderItemsQuery.recordset.map(this.orderItemsTableToOrderItem))

    return orderItems
  }

  static async read (id: number): Promise<Order> {
    const rawOrder = await this.rawOrder(id)

    const order = await this.ordersTableToOrder(rawOrder)

    return order
  }

  static async readByCustomerId (customerId: number): Promise<Order[]> {
    const ordersQuery = await (
      await connection
    ).query<OrdersTable>`SELECT * FROM Orders WHERE customer_id = ${customerId}`

    const orders = await Promise.all(ordersQuery.recordset.map(this.ordersTableToOrder))

    return orders
  }

  static async readOrderItem (orderId: number, itemId: number): Promise<OrderItem> {
    await this.rawOrder(orderId)

    const orderItemQuery = await (await connection).query<OrderItemsTable>`SELECT * FROM OrderItems WHERE order_id = ${orderId} AND id = ${itemId}`
    const rawOrderItem = orderItemQuery.recordset[0]

    if (rawOrderItem === undefined) {
      throw new ItemNotFound(itemId, { typeName: 'orderItem', method: 'read' })
    }

    const orderItem = await this.orderItemsTableToOrderItem(rawOrderItem)

    return orderItem
  }

  static async create (input: InputOrder): Promise<Order> {
    const { customer_id: customerId, total_price: totalPrice, status } = input

    const statusId = await this.readStatusId(status)

    await customerModel.read(customerId)

    const insertQuery = await (await connection).query<Pick<OrdersTable, 'id'>>`
    INSERT INTO Orders (customer_id, total_price, status_id)
    VALUES (${customerId}, ${totalPrice}, ${statusId})
    SELECT SCOPE_IDENTITY() as id
    `

    const id = insertQuery.recordset[0].id

    return await this.read(id)
  }

  static async createOrderItem (orderId: number, input: InputOrderItem): Promise<OrderItem> {
    const { quantity, product_id: productId } = input

    await this.rawOrder(orderId)
    await inventoryItemModel.read(productId)

    const insertQuery = await (await connection).query<Pick<OrderItemsTable, 'id'>>`
    INSERT INTO OrderItems (order_id, product_id, quantity)
    VALUES (${orderId}, ${productId}, ${quantity})
    SELECT SCOPE_IDENTITY() as id
    `

    const id = insertQuery.recordset[0].id

    return await this.readOrderItem(orderId, id)
  }

  static async update (id: number, input: Partial<InputOrder>): Promise<Order> {
    const request = (await connection).request()

    input.customer_id !== undefined && await customerModel.read(input.customer_id)

    const statusId = input.status !== undefined && await this.readStatusId(input.status)

    const keys = Object.keys(input) as Array<keyof typeof input>

    request.input('id', id)
    keys.forEach((key, index) => {
      request.input(`param${index}`, key === 'status' ? statusId : input[key])
    })

    const updateKeys = keys.map((key) => key === 'status' ? 'status_id' : key)
    const sets = updateKeys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE Orders SET ${sets.join(', ')} WHERE id = @id`

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'order', method: 'update' })
    }

    return await this.read(id)
  }

  static async updateOrderItem (orderId: number, itemId: number, input: Partial<InputOrderItem>) {
    const request = (await connection).request()

    input.product_id !== undefined && await inventoryItemModel.read(input.product_id)

    const keys = Object.keys(input) as Array<keyof typeof input>

    request.input('order_id', orderId)
    request.input('item_id', itemId)
    keys.forEach((key, index) => {
      request.input(`param${index}`, input[key])
    })

    const sets = keys.map((key, index) => `${key} = @param${index}`)

    const query = `UPDATE OrderItems SET ${sets.join(', ')} WHERE id = @item_id AND order_id = @order_id `

    const response = await request.query(query)

    if (response.rowsAffected[0] === 0) {
      throw new ItemNotFound(itemId, { typeName: 'orderItem', method: 'update' })
    }

    return await this.readOrderItem(orderId, itemId)
  }

  static async delete (id: number): Promise<void> {
    const deleteQuery = await (await connection).query`DELETE FROM Orders WHERE id = ${id}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(id, { typeName: 'order', method: 'delete' })
    }
  }

  static async deleteOrderItem (orderId: number, itemId: number): Promise<void> {
    await this.rawOrder(orderId)

    const deleteQuery = await (await connection).query`DELETE FROM OrderItems WHERE order_id = ${orderId} AND id = ${itemId}`

    if (deleteQuery.rowsAffected[0] === 0) {
      throw new ItemNotFound(itemId, { typeName: 'orderItem', method: 'delete' })
    }
  }
}

export default orderModel
