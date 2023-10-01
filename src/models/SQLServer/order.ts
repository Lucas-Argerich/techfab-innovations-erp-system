import sql from 'mssql'
import mssqlConfig from '../../constants/mssqlConfig'
import {
  type OrdersStatusTable,
  type OrderProductsTable,
  type OrdersTable
} from './types'
import { type Order, type OrderStatus } from '../types'
import { inventoryItemModel } from './inventoryItem'
import { customerModel } from './customer'

const connection = sql.connect(mssqlConfig)

export const orderModel = {
  readStatus: async (statusId: number): Promise<OrderStatus> => {
    const statusQuery = await (
      await connection
    ).query<OrdersStatusTable>`SELECT * FROM OrderStatus WHERE id = ${statusId}`

    const status = statusQuery.recordset[0].status as OrderStatus

    return status
  },
  readByCustomerId: async (customerId: number): Promise<Order[]> => {
    const ordersQuery = await (
      await connection
    ).query<OrdersTable>`SELECT * FROM Orders WHERE customer_id = ${customerId}`

    const orders = await Promise.all(
      ordersQuery.recordset.map(async (order) => {
        const {
          id,
          customer_id: customerId,
          total_price: totalPrice,
          status_id: statusId
        } = order

        const productsQuery = await (
          await connection
        )
          .query<OrderProductsTable>`SELECT * FROM OrderProducts WHERE order_id = ${id}`

        const products = productsQuery.recordset.map((product) => {
          const { quantity, product_id: productId } = product
          const getProduct = async () =>
            await inventoryItemModel.read(productId)
          return { quantity, product: getProduct }
        })

        const status = await orderModel.readStatus(statusId)

        const getCustomer = async () => await customerModel.read(customerId)
        return { id, products, total_price: totalPrice, status, customer: getCustomer }
      })
    )
    return orders
  }
}
