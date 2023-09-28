import { ItemNotFound } from '../constants/errors'
import { type Employee } from '../types/db-types'
import { db } from '../utils/utils'

export const employeeModel = {
  readAll: async () => {
    return db.employees
  },
  readById: async (id: number) => {
    const item = db.employees.find((item) => item.id === id)

    if (item === undefined) {
      throw new ItemNotFound(id, { typeName: 'employees', method: 'read' })
    }

    return item
  },
  create: async (input: Omit<Employee, 'id'>) => {
    const id = db.employees.length + 1

    db.employees.push({ id, ...input })

    return await employeeModel.readById(id)
  },
  update: async (id: number, input: Partial<Omit<Employee, 'id'>>) => {
    const index = db.employees.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new ItemNotFound(id, { typeName: 'employees', method: 'update' })
    }

    db.employees[index] = { ...db.employees[index], ...input }

    return await employeeModel.readById(id)
  },
  delete: async (id: number) => {
    const index = db.employees.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new ItemNotFound(id, { typeName: 'employees', method: 'delete' })
    }

    db.employees.splice(index, 1)

    db.employees.map((item, i) => (item.id = i + 1))
  }
}
