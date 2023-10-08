// import { ItemNotFound } from '../../constants/errors'
// import { type ProductionItem } from '../../types/db-types'
// import { db } from '../../utils/utils'
// import { inventoryItemModel } from './inventoryItem'

// export const productionItemModel = {
//   readAll: async () => {
//     return db.production
//   },
//   read: async (id: number) => {
//     const item = db.production.find((item) => item.id === id)

//     if (item === undefined) {
//       throw new ItemNotFound(id, { typeName: 'production', method: 'read' })
//     }

//     return item
//   },
//   create: async (input: Omit<ProductionItem, 'id'>) => {
//     const id = db.production.length + 1

//     await inventoryItemModel.read(input.product_id)

//     db.production.push({ id, ...input })

//     return await productionItemModel.read(id)
//   },
//   update: async (id: number, input: Partial<Omit<ProductionItem, 'id'>>) => {
//     const index = db.production.findIndex((item) => item.id === id)

//     if (index === -1) {
//       throw new ItemNotFound(id, { typeName: 'production', method: 'update' })
//     }

//     if (input.product_id !== undefined) {
//       await inventoryItemModel.read(input.product_id)
//     }

//     db.production[index] = { ...db.production[index], ...input }

//     return await productionItemModel.read(id)
//   },
//   delete: async (id: number) => {
//     const index = db.production.findIndex((item) => item.id === id)

//     if (index === -1) {
//       throw new ItemNotFound(id, { typeName: 'production', method: 'delete' })
//     }

//     db.customers.splice(index, 1)

//     db.customers.map((item, i) => (item.id = i + 1))
//   }
// }
