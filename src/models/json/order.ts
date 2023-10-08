// import { ItemNotFound } from '../../constants/errors'
// import { type Order } from '../../types/db-types'
// import { db } from '../../utils/utils'
// import { customerModel } from './customer'
// import { inventoryItemModel } from './inventoryItem'

// export const orderModel = {
//   readAll: async () => {
//     return db.orders
//   },
//   read: async (id: number) => {
//     const item = db.orders.find((item) => item.id === id)

//     if (item === undefined) {
//       throw new ItemNotFound(id, { typeName: 'orders', method: 'read' })
//     }

//     return item
//   },
//   create: async (input: Omit<Order, 'id'>) => {
//     const id = db.orders.length + 1

//     await customerModel.read(input.customer_id)
//     // will throw ItemNotFound err if doesn't exist

//     for (const product of input.products) {
//       await inventoryItemModel.read(product.product_id)
//     }

//     db.orders.push({ id, ...input })

//     return await orderModel.read(id)
//   },
//   update: async (id: number, input: Partial<Omit<Order, 'id'>>) => {
//     const index = db.orders.findIndex((item) => item.id === id)

//     if (index === -1) {
//       throw new ItemNotFound(id, { typeName: 'orders', method: 'update' })
//     }

//     if (input.customer_id !== undefined) {
//       await customerModel.read(input.customer_id)
//       // will throw ItemNotFound err if doesn't exist
//     }

//     if (input.products !== undefined) {
//       for (const product of input.products) {
//         await inventoryItemModel.read(product.product_id)
//       }
//     }

//     db.orders[index] = { ...db.orders[index], ...input }

//     return await orderModel.read(id)
//   },
//   delete: async (id: number) => {
//     const index = db.orders.findIndex((item) => item.id === id)

//     if (index === -1) {
//       throw new ItemNotFound(id, { typeName: 'orders', method: 'delete' })
//     }

//     db.orders.splice(index, 1)

//     db.customers.map((item, i) => (item.id = i + 1))
//   }
// }
