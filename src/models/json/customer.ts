import { ItemNotFound } from '../../constants/errors'
import { type Customer } from '../../types/db-types'
import { db } from '../../utils/utils'

export const customerModel = {
  readAll: async () => {
    return db.customers
  },
  read: async (id: number) => {
    const item = db.customers.find((item) => item.id === id)

    if (item === undefined) {
      throw new ItemNotFound(id, { typeName: 'customers', method: 'read' })
    }

    return item
  },
  create: async (input: Omit<Customer, 'id' | 'order_ids'>) => {
    const id = db.customers.length + 1

    db.customers.push({ id, ...input, order_ids: [] })

    return await customerModel.read(id)
  },
  update: async (id: number, input: Partial<Omit<Customer, 'id'>>) => {
    const index = db.customers.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new ItemNotFound(id, { typeName: 'customers', method: 'create' })
    }

    db.customers[index] = { ...db.customers[index], ...input }

    return await customerModel.read(id)
  },
  delete: async (id: number) => {
    const index = db.customers.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new ItemNotFound(id, { typeName: 'customers', method: 'delete' })
    }

    db.customers.splice(index, 1)

    db.customers.map((item, i) => (item.id = i + 1))
  }
}
