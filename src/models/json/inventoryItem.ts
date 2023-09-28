import { ItemNotFound } from '../../constants/errors'
import { type InventoryItem } from '../../types/db-types'
import { db } from '../../utils/utils'

export const inventoryItemModel = {
  readAll: async () => {
    return db.inventory
  },
  read: async (id: number) => {
    const item = db.inventory.find((item) => item.id === id)

    if (item === undefined) {
      throw new ItemNotFound(id, { typeName: 'inventory', method: 'read' })
    }

    return item
  },
  create: async (input: Omit<InventoryItem, 'id'>) => {
    const id = db.inventory.length + 1

    db.inventory.push({ id, ...input })

    return await inventoryItemModel.read(id)
  },
  update: async (id: number, input: Partial<Omit<InventoryItem, 'id'>>) => {
    const index = db.inventory.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new ItemNotFound(id, { typeName: 'inventory', method: 'update' })
    }

    db.inventory[index] = { ...db.inventory[index], ...input }

    return await inventoryItemModel.read(id)
  },
  delete: async (id: number) => {
    const index = db.inventory.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new ItemNotFound(id, { typeName: 'inventory', method: 'delete' })
    }

    db.inventory.splice(index, 1)

    db.inventory.map((item, i) => (item.id = i + 1))
  }
}
